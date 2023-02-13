"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoaWsFilter = void 0;
const WebSocket = require("ws");
const koaCompose = require("koa-compose");
const events_1 = require("events");
class KoaWsFilter {
    constructor() {
        this.wsServer = new WebSocket.Server({
            noServer: true,
            clientTracking: true,
        });
        this.httpMws = [];
        this.wsMws = [];
    }
    async close(code, reason) {
        await Promise.all([...this.wsServer.clients].map(client => {
            client.close(code, reason);
            return (0, events_1.once)(client, 'close');
        }));
    }
    static isWebSocket(ctx) {
        if (typeof ctx.req.headers.upgrade === 'undefined')
            return false;
        return !!ctx.req.headers.upgrade
            .split(',')
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
            if (KoaWsFilter.isWebSocket(ctx)) {
                ctx.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                };
                const composed = koaCompose(this.wsMws);
                await composed(ctx, next);
            }
            else {
                const composed = koaCompose(this.httpMws);
                await composed(ctx, next);
            }
        };
    }
    http(middleware) {
        this.httpMws.push(middleware);
        return this;
    }
    ws(middleware) {
        this.wsMws.push(middleware);
        return this;
    }
}
exports.KoaWsFilter = KoaWsFilter;
//# sourceMappingURL=index.js.map