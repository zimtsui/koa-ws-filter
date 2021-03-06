import Koa = require('koa');
import { KoaWsFilter } from '../..';
import WebSocket = require('ws');
import test from 'ava';
import axios from 'axios';
import { once } from 'events';
import Bluebird = require('bluebird');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import Router = require('@koa/router');
chai.use(chaiAsPromised);
const { assert } = chai;

test.serial('1', async t => {
    const koa = new Koa();
    const filter = new KoaWsFilter();
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

    const resPromise = axios.get('http://localhost:3000');
    assert.isRejected(resPromise);
    const error = await resPromise.catch(e => e);
    assert.strictEqual(error.response.data, '404 NOT FOUND');
    assert.strictEqual(error.response.status, 404);

    const client = new WebSocket('ws://localhost:3000');
    const msg = await Bluebird.any<any>([
        Bluebird.delay(3000),
        once(client, 'message'),
        once(client, 'close'),
    ]);
    assert.strictEqual(msg[0], 'hello');
});
