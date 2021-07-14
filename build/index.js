"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = exports.KoaWsFilter = exports.default = void 0;
const WebSocket = require("ws");
exports.WebSocket = WebSocket;
const koaCompose = require("koa-compose");
const events_1 = require("events");
class KoaWsFilter {
    constructor() {
        this.wsServer = new WebSocket.Server({
            noServer: true,
            clientTracking: true,
        });
        this.httpMWs = [];
        this.wsMWs = [];
    }
    async closeAsync(code, reason) {
        await Promise.all([...this.wsServer.clients].map(client => {
            client.close(code, reason);
            return events_1.once(client, 'close');
        }));
    }
    isWebSocket(ctx) {
        return !!ctx.req.headers.upgrade
            ?.split(',')
            .map(protocol => protocol.trim())
            .includes('websocket');
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
exports.default = KoaWsFilter;
exports.KoaWsFilter = KoaWsFilter;
//# sourceMappingURL=index.js.map