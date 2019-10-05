"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const koa_compose_1 = __importDefault(require("koa-compose"));
class KoaWsFilter {
    constructor() {
        this.wsServer = new ws_1.default.Server({ noServer: true });
        this.httpMWs = [];
        this.wsMWs = [];
    }
    isWebSocket(ctx) {
        return ctx.req.headers.upgrade === 'websocket';
    }
    makeWebSocket(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.wsServer.handleUpgrade(ctx.req, ctx.req.socket, Buffer.alloc(0), resolve);
            });
        });
    }
    filter() {
        return (ctx, next) => {
            if (this.isWebSocket(ctx)) {
                ctx.upgrade = () => {
                    ctx.respond = false;
                    return this.makeWebSocket(ctx);
                };
                const f = koa_compose_1.default(this.wsMWs);
                f(ctx, next);
            }
            else {
                const f = koa_compose_1.default(this.httpMWs);
                f(ctx, next);
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
//# sourceMappingURL=index.js.map