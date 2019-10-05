import WebSocket from 'ws';
import koaCompose from 'koa-compose';
import { Context, Middleware } from 'koa';

class KoaWsFilter {
    private wsServer = new WebSocket.Server({ noServer: true });
    private httpMWs: Middleware[] = [];
    private wsMWs: Middleware[] = [];

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

    public filter(): Middleware {
        return (ctx, next) => {
            if (this.isWebSocket(ctx)) {
                ctx.ws = this.makeWebSocket(ctx);
                const f = koaCompose(this.wsMWs);
                f(ctx, next);
            } else {
                const f = koaCompose(this.httpMWs);
                f(ctx, next);
            }
        }
    }

    public http(f: Middleware): this {
        this.httpMWs.push(f);
        return this;
    }

    public ws(f: Middleware): this {
        this.wsMWs.push(f);
        return this;
    }
}

export default KoaWsFilter;