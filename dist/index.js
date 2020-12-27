import WebSocket from 'ws';
import koaCompose from 'koa-compose';
import { once } from 'events';
class KoaWsFilter {
    constructor() {
        this.wsServer = new WebSocket.Server({
            noServer: true,
            clientTracking: true,
        });
        this.httpMWs = [];
        this.wsMWs = [];
    }
    async close(code, reason) {
        await Promise.all([...this.wsServer.clients].map(client => {
            client.close(code, reason);
            return once(client, 'close');
        }));
    }
    isWebSocket(ctx) {
        return ctx.req.headers.upgrade === 'websocket';
    }
    async makeWebSocket(ctx) {
        return new Promise(resolve => {
            this.wsServer.handleUpgrade(ctx.req, ctx.req.socket, Buffer.alloc(0), resolve);
        });
    }
    protocols() {
        return async (ctx, next) => {
            if (this.isWebSocket(ctx)) {
                ctx.state.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                };
                const f = koaCompose(this.wsMWs);
                await f(ctx, next);
            }
            else {
                const f = koaCompose(this.httpMWs);
                await f(ctx, next);
            }
        };
    }
    http(f) {
        this.httpMWs.push(f);
        return this;
    }
    ws(f) {
        this.wsMWs.push(f);
        return this;
    }
}
export { KoaWsFilter as default, KoaWsFilter, WebSocket, };
//# sourceMappingURL=index.js.map