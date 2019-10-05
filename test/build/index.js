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
const koa_1 = __importDefault(require("koa"));
const __1 = __importDefault(require("../../"));
const ws_1 = __importDefault(require("ws"));
const ava_1 = __importDefault(require("ava"));
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
const bluebird_1 = __importDefault(require("bluebird"));
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
chai_1.default.use(chai_as_promised_1.default);
const { assert } = chai_1.default;
ava_1.default.serial('1', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const koa = new koa_1.default();
    const filter = new __1.default();
    filter.http((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.status = 404;
        yield next();
    }));
    filter.http((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.body = '404 NOT FOUND';
        yield next();
    }));
    filter.ws((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        const ws = yield ctx.upgrade();
        yield new Promise(resolve => ws.send('hello', resolve));
        ws.close();
        yield next();
    }));
    koa.use(filter.filter());
    koa.listen(3000);
    const resPromise = axios_1.default.get('http://localhost:3000');
    assert.isRejected(resPromise);
    const error = yield resPromise.catch(e => e);
    assert.strictEqual(error.response.data, '404 NOT FOUND');
    assert.strictEqual(error.response.status, 404);
    const client = new ws_1.default('ws://localhost:3000');
    const msg = yield bluebird_1.default.any([
        bluebird_1.default.delay(3000),
        events_1.once(client, 'message'),
        events_1.once(client, 'close'),
    ]);
    assert.strictEqual(msg[0], 'hello');
}));
//# sourceMappingURL=index.js.map