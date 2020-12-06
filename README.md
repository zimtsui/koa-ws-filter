# koa-ws-filter

## Usage

This is intended to separate *websocket upgrade request* and *normal http request* for Koa 2.

The usage is similar to [koa-router](https://github.com/koajs/router)

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
    // accept upgrade request from http to websocket
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
