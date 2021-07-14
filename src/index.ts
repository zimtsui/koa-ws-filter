import WebSocket = require('ws');
import koaCompose = require('koa-compose');
import { once } from 'events';
import {
    Middleware,
    DefaultContext,
    DefaultState,
    ParameterizedContext,
} from 'koa';

export interface Upgrade {
    (): Promise<WebSocket>;
}

export type Upgraded<CustomT> = CustomT & {
    upgrade: Upgrade;
}

export class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
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

    private static isWebSocket(ctx: ParameterizedContext): boolean {
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

    public protocols<NewStateT = {}, NewCustomT = {}>() {
        return async (
            ctx: ParameterizedContext<StateT & NewStateT, CustomT & NewCustomT>,
            next: () => Promise<void>,
        ) => {
            if (KoaWsFilter.isWebSocket(ctx)) {
                (<ParameterizedContext<StateT & NewStateT, Upgraded<CustomT> & NewCustomT>>ctx)
                    .upgrade = () => {
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

    public ws<NewStateT = {}, NewCustomT = {}>(
        f: Middleware<StateT & NewStateT, Upgraded<CustomT> & NewCustomT>,
    ): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT> {
        this.wsMWs.push(f);
        return this;
    }
}
