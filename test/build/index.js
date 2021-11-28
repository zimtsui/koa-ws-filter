"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const __1 = require("../..");
const WebSocket = require("ws");
const ava_1 = require("ava");
const axios_1 = require("axios");
const events_1 = require("events");
const Bluebird = require("bluebird");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const Router = require("@koa/router");
chai.use(chaiAsPromised);
const { assert } = chai;
ava_1.default.serial('1', async (t) => {
    const koa = new Koa();
    const filter = new __1.KoaWsFilter();
    const router = new Router();
    router.get('/', async (ctx, next) => {
        ctx.status = 404;
        await next();
    });
    router.get('/', async (ctx, next) => {
        ctx.body = '404 NOT FOUND';
        await next();
    });
    filter.http(router.routes());
    filter.ws(async (ctx, next) => {
        const ws = await ctx.upgrade();
        await new Promise(resolve => void ws.send('hello', resolve));
        ws.close();
        await next();
    });
    koa.use(filter.protocols());
    koa.listen(3000);
    const resPromise = axios_1.default.get('http://localhost:3000');
    assert.isRejected(resPromise);
    const error = await resPromise.catch(e => e);
    assert.strictEqual(error.response.data, '404 NOT FOUND');
    assert.strictEqual(error.response.status, 404);
    const client = new WebSocket('ws://localhost:3000');
    const msg = await Bluebird.any([
        Bluebird.delay(3000),
        (0, events_1.once)(client, 'message'),
        (0, events_1.once)(client, 'close'),
    ]);
    assert.strictEqual(msg[0], 'hello');
});
//# sourceMappingURL=index.js.map