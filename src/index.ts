import WebSocket = require('ws');
import koaCompose = require('koa-compose');
import { once } from 'events';
import {
    Middleware,
    DefaultContext,
    DefaultState,
    Context,
} from 'koa';

export type Upgraded<ContextT> = ContextT & {
    upgrade: () => Promise<WebSocket>;
}

export class KoaWsFilter<StateT = DefaultState, ContextT = DefaultContext> {
    public wsServer = new WebSocket.Server({
        noServer: true,
        clientTracking: true,
    });
    private httpMws: Middleware<any, any>[] = [];
    private wsMws: Middleware<any, any>[] = [];

    public async close(code?: number, reason?: string) {
        await Promise.all(
            [...this.wsServer.clients].map(client => {
                client.close(code, reason);
                return once(client, 'close');
            })
        );
    }

    private static isWebSocket(ctx: Context): boolean {
        if (typeof ctx.req.headers.upgrade === 'undefined') return false;
        return !!ctx.req.headers.upgrade
            .split(',')
            .map(protocol => protocol.trim())
            .includes('websocket');
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

    public protocols(): Middleware<StateT, Upgraded<ContextT>> {
        return async (ctx, next: () => Promise<void>) => {
            if (KoaWsFilter.isWebSocket(ctx)) {
                ctx.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                }
                const composed = koaCompose(this.wsMws);
                await composed(ctx, next);
            } else {
                const composed = koaCompose(this.httpMws);
                await composed(ctx, next);
            }
        }
    }

    public http<NewStateT = {}, NewContextT = {}>(
        middleware: Middleware<StateT & NewStateT, ContextT & NewContextT>,
    ): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT> {
        this.httpMws.push(middleware);
        return this;
    }

    public ws<NewStateT = {}, NewContextT = {}>(
        middleware: Middleware<StateT & NewStateT, Upgraded<ContextT> & NewContextT>,
    ): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT> {
        this.wsMws.push(middleware);
        return this;
    }
}
