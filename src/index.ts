import WebSocket = require('ws');
import koaCompose = require('koa-compose');
import { once } from 'events';
import {
    Middleware,
    DefaultContext,
    DefaultState,
    ParameterizedContext,
} from 'koa';

interface Upgrade {
    (): Promise<WebSocket>;
}

interface UpgradeState {
    upgrade: Upgrade;
}

class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    public wsServer = new WebSocket.Server({
        noServer: true,
        clientTracking: true,
    });
    private httpMWs: Middleware<any, any>[] = [];
    private wsMWs: Middleware<any, any>[] = [];

    public async closeAsync(code?: number, reason?: string) {
        await Promise.all(
            [...this.wsServer.clients].map(client => {
                client.close(code, reason);
                return once(client, 'close');
            })
        );
    }

    private isWebSocket(ctx: ParameterizedContext<StateT, CustomT>): boolean {
        return !!ctx.req.headers.upgrade
            ?.split(',')
            .map(protocol => protocol.trim())
            .includes('websocket');
    }

    private async makeWebSocket(ctx: ParameterizedContext<StateT, CustomT>): Promise<WebSocket> {
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
            ctx: ParameterizedContext<StateT & {
                upgrade: Upgrade;
            }, CustomT>,
            next: () => Promise<void>,
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
        f: Middleware<StateT & NewStateT, CustomT & NewCustomT>,
    ): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT> {
        this.httpMWs.push(f);
        return this;
    }

    public ws<NewStateT = UpgradeState, NewCustomT = {}>(
        f: Middleware<StateT & NewStateT, CustomT & NewCustomT>,
    ): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT> {
        this.wsMWs.push(f);
        return this;
    }
}

export {
    KoaWsFilter as default,
    KoaWsFilter,
    UpgradeState,
    WebSocket,
};
