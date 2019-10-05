import { Middleware } from 'koa';
declare class KoaWsFilter {
    private wsServer;
    private httpMWs;
    private wsMWs;
    private isWebSocket;
    private makeWebSocket;
    filter(): Middleware;
    http(f: Middleware): this;
    ws(f: Middleware): this;
}
export default KoaWsFilter;
