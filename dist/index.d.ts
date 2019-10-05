import WebSocket from 'ws';
import { Middleware } from 'koa';
declare class KoaWsFilter {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    private isWebSocket;
    private makeWebSocket;
    filter(): Middleware;
    http(f: Middleware): this;
    ws(f: Middleware): this;
}
export default KoaWsFilter;
