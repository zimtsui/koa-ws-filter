import WebSocket from 'ws';
import koaCompose from 'koa-compose';
import {
    Middleware,
    Context,
    // ParameterizedContext,
    DefaultContext,
    DefaultState,
    // BaseContext,
} from 'koa';

class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    public wsServer = new WebSocket.Server({ noServer: true });
    private httpMWs: Middleware<any, any>[] = [];
    private wsMWs: Middleware<any, any>[] = [];

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

    public filter(
    ) {
        return (
            ctx: Context,
            next: () => Promise<any>,
        ) => {
            if (this.isWebSocket(ctx)) {
                type Upgrade = () => Promise<WebSocket>;
                type UpgradeContext = Context & { upgrade: Upgrade; }
                ctx.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                }
                const f = koaCompose(this.wsMWs);
                f(<UpgradeContext>ctx, next);
            } else {
                const f = koaCompose(this.httpMWs);
                f(ctx, next);
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
        f: Middleware<StateT & NewStateT, CustomT & NewCustomT>
    ): this {
        this.wsMWs.push(f);
        return this;
    }
}

export default KoaWsFilter;