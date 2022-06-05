# koa-ws-filter

[![Npm package version](https://badgen.net/npm/v/@zimtsui/koa-ws-filter)](https://www.npmjs.com/package/@zimtsui/koa-ws-filter)

## Usage

This middleware is intended to separate *websocket upgrade request* and *normal http request* for Koa 2.

The usage is similar to [@koajs/router](https://github.com/koajs/router)

```
koaRouter.<method>(<path>, <middleware>);
koaWsfilter.<protocol>(<middleware>);

koaRouter.routes()
koaWsFilter.protocols()
```

## Example

```ts
import WebSocket from 'ws';
import Koa from 'koa';
import Router from '@koa/router';

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

const filter = new KoaWsFilter();
filter.ws(wsRouter.routes());

const koa = new Koa();
koa.use(filter.protocols());
koa.listen(3000);
```
