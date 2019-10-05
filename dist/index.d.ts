import WebSocket from 'ws';
import { Middleware, Context, DefaultContext, DefaultState } from 'koa';
declare class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    private isWebSocket;
    private makeWebSocket;
    filter(): (ctx: Context, next: () => Promise<any>) => void;
    http<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): this;
    ws<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): this;
}
export default KoaWsFilter;
