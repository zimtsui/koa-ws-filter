import WebSocket from 'ws';
import koaCompose from 'koa-compose';
import { once } from 'events';
import {
    Middleware,
    Context,
    DefaultContext,
    DefaultState,
} from 'koa';

type Upgrade = () => Promise<WebSocket>;
type UpgradeCustomT = Context & { upgrade: Upgrade; }

class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    public wsServer = new WebSocket.Server({
        noServer: true,
        clientTracking: true,
    });
    private httpMWs: Middleware<any, any>[] = [];
    private wsMWs: Middleware<any, any>[] = [];

    public async close(code?: number, reason?: string) {
        await Promise.all(
            [...this.wsServer.clients].map(client => {
                client.close(code, reason);
                return once(client, 'close');
            })
        );
    }

    private isWebSocket(ctx: Context): boolean {
        return ctx.req.headers.upgrade === 'websocket';
    }

    private async makeWebSocket(ctx: Context): Promise<WebSocket> {
        return new Promise(resolve => {
            this.wsServer.handleUpgrade(
                ctx.req,
                ctx.req.socket,
                Buffer.alloc(0),
                resolve,
            );
        });
    }

    public protocols() {
        return async (
            ctx: Context,
            next: () => Promise<any>,
        ) => {
            if (this.isWebSocket(ctx)) {
                ctx.state.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                }
                const f = koaCompose(this.wsMWs);
                await f(ctx, next);
            } else {
                const f = koaCompose(this.httpMWs);
                await f(ctx, next);
            }
        }
    }

    public http<NewStateT = {}, NewCustomT = {}>(
        f: Middleware<StateT & NewStateT, CustomT & NewCustomT>
    ): this {
        this.httpMWs.push(f);
        return this;
    }

    public ws<NewStateT = {}, NewCustomT = {}>(
        f: Middleware<
            StateT & NewStateT,
            CustomT & NewCustomT & UpgradeCustomT
        >
    ): this {
        this.wsMWs.push(f);
        return this;
    }
}

export {
    KoaWsFilter as default,
    KoaWsFilter,
};
