import WebSocket from 'ws';
import { Middleware, Context, DefaultContext, DefaultState } from 'koa';
declare type Upgrade = () => Promise<WebSocket>;
declare type UpgradeCustomT = Context & {
    upgrade: Upgrade;
};
declare class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    close(): Promise<void>;
    private isWebSocket;
    private makeWebSocket;
    filter(): (ctx: Context, next: () => Promise<any>) => Promise<void>;
    http<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): this;
    ws<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT & UpgradeCustomT>): this;
}
export default KoaWsFilter;
