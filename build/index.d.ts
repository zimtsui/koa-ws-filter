import WebSocket = require('ws');
import { Middleware, DefaultContext, DefaultState, ParameterizedContext } from 'koa';
interface Upgrade {
    (): Promise<WebSocket>;
}
interface UpgradeState {
    upgrade: Upgrade;
}
declare class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    closeAsync(code?: number, reason?: string): Promise<void>;
    private isWebSocket;
    private makeWebSocket;
    protocols(): (ctx: ParameterizedContext<StateT & {
        upgrade: Upgrade;
    }, CustomT>, next: () => Promise<void>) => Promise<void>;
    http<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
    ws<NewStateT = UpgradeState, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
}
export { KoaWsFilter as default, KoaWsFilter, UpgradeState, WebSocket, };
