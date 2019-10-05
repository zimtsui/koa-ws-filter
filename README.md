# koa-ws-filter

A standard koa 2 middleware to separate *websocket upgrade request* and *normal http request*.

```ts
const filter = new KoaWsFilter();

const httpRouter = new Router();
httpRouter.get('/hello', async (ctx, next) => {
    ctx.body = 'hello';
    await next();
});
filter.http(httpRouter.routes());

const wsRouter = new Router();
wsRouter.all('/hello', async (ctx, next) => {
    // accept upgrade request from http to websocket
    const ws = await ctx.upgrade(); 

    await next();

    // echo
    ws.on('message', ws.send); 
});
filter.ws(wsRouter.routes());

// method .filter() returns a standard middleware,
// which can be passed to koa, koa-router, etc.
const koa = new Koa();
koa.use(filter.filter());
koa.listen(3000);
```

the principle and usage are the same as [koa-router](https://github.com/ZijianHe/koa-router), except that:

- koa-router filters path of request.
- koa-ws-filter filters protocol of request.