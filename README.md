# koa-ws-filter

[![Npm package version](https://badgen.net/npm/v/@zimtsui/koa-ws-filter)](https://www.npmjs.com/package/@zimtsui/koa-ws-filter)

This middleware is intended to separate *websocket upgrade request* and *normal http request* for Koa 2.

## Comparison

Why not [@kudos/koa-websocket](https://github.com/kudos/koa-websocket)?

Beacause it is not a standard koa middleware. It polyfills the Koa object instead, breaking the encapsulation of Koa.

Why not [@b3nsn0w/koa-easy-ws](https://github.com/b3nsn0w/koa-easy-ws)

Because a user middleware needs a conditional clause to predicate whether a connection is websocket. It's not graceful.

The graceful way is demonstrated by @koajs/router. See the usage below.

## Usage

The grammar is similar to [@koajs/router](https://github.com/koajs/router)

```diff
-   koaRouter.<method>(<path>, <user-middleware>);
+   koaWsfilter.<protocol>(<user-middleware>);

-   koaRouter.routes()
+   koaWsFilter.protocols()
```

## Examples

```ts
import WebSocket from 'ws';
import Koa from 'koa';
import Router from '@koa/router';

const filter = new KoaWsFilter();

const httpRouter = new Router();
httpRouter.get('/hello', async (ctx, next) => {
    ctx.body = 'hello';
    await next();
});
filter.http(httpRouter.routes());

const wsRouter = new Router();
wsRouter.all('/echo', async (ctx, next) => {
    // accept the websocket upgrade request
    const ws: WebSocket = await ctx.upgrade();
    await next();

    // echo
    ws.on('message', message => ws.send(message));
});
filter.ws(wsRouter.routes());

const koa = new Koa();
koa.use(filter.protocols());
koa.listen(3000);
```
