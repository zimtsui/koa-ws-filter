import WebSocket = require('ws');
import koaCompose = require('koa-compose');
import { once } from 'events';
import {
    Middleware,
    DefaultContext,
    DefaultState,
} from 'koa';

export interface Upgrade {
    (): Promise<WebSocket>;
}

export type Upgraded<ContextT> = ContextT & {
    upgrade: Upgrade;
}

export class KoaWsFilter<StateT = DefaultState, ContextT = DefaultContext> {
    public wsServer = new WebSocket.Server({
        noServer: true,
        clientTracking: true,
    });
    private httpMiddlewares: Middleware<any, any>[] = [];
    private wsMiddlewares: Middleware<any, any>[] = [];

    public async closeAsync(code?: number, reason?: string) {
        await Promise.all(
            [...this.wsServer.clients].map(client => {
                client.close(code, reason);
                return once(client, 'close');
            })
        );
    }

    private static isWebSocket(ctx: Parameters<Middleware<{}, {}>>[0]): boolean {
        if (typeof ctx.req.headers.upgrade === 'undefined') return false;
        return !!ctx.req.headers.upgrade
            .split(',')
            .map(protocol => protocol.trim())
            .includes('websocket');
    }

    private async makeWebSocket(ctx: Parameters<Middleware<{}, {}>>[0]): Promise<WebSocket> {
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
                const composed = koaCompose(this.wsMiddlewares);
                await composed(ctx, next);
            } else {
                const composed = koaCompose(this.httpMiddlewares);
                await composed(ctx, next);
            }
        }
    }

    public http<NewStateT = {}, NewContextT = {}>(
        middleware: Middleware<StateT & NewStateT, ContextT & NewContextT>,
    ): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT> {
        this.httpMiddlewares.push(middleware);
        return this;
    }

    public ws<NewStateT = {}, NewContextT = {}>(
        middleware: Middleware<StateT & NewStateT, Upgraded<ContextT> & NewContextT>,
    ): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT> {
        this.wsMiddlewares.push(middleware);
        return this;
    }
}
