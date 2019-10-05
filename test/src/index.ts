import Koa from 'koa';
import KoaWsFilter from '../../';
import WebSocket from 'ws';
import test from 'ava';
import axios from 'axios';
import { once } from 'events';
import Bluebird from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { assert } = chai;

test.serial('1', async t => {
    const koa = new Koa();
    const filter = new KoaWsFilter();

    filter.http(async (ctx, next) => {
        ctx.status = 404;
        await next();
    });

    filter.http(async (ctx, next) => {
        ctx.body = '404 NOT FOUND';
        await next();
    })

    filter.ws(async (ctx, next) => {
        const ws: WebSocket = await ctx.upgrade();
        await new Promise(resolve => ws.send('hello', resolve));
        ws.close();
        await next();
    });

    koa.use(filter.filter());
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