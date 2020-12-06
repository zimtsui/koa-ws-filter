import WebSocket from 'ws';
import { Middleware, DefaultContext, DefaultState, ParameterizedContext } from 'koa';
interface Upgrade {
    (): Promise<WebSocket>;
}
declare class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    close(code?: number, reason?: string): Promise<void>;
    private isWebSocket;
    private makeWebSocket;
    protocols(): (ctx: ParameterizedContext<StateT & {
        upgrade: Upgrade;
    }, CustomT>, next: () => Promise<void>) => Promise<void>;
    http<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
    ws<NewStateT = {
        upgrade: Upgrade;
    }, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
}
export { KoaWsFilter as default, KoaWsFilter, };
