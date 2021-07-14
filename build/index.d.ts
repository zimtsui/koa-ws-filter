import WebSocket = require('ws');
import { Middleware, DefaultContext, DefaultState, ParameterizedContext } from 'koa';
export interface Upgrade {
    (): Promise<WebSocket>;
}
export declare type Upgraded<CustomT> = CustomT & {
    upgrade: Upgrade;
};
export declare class KoaWsFilter<StateT = DefaultState, CustomT = DefaultContext> {
    wsServer: WebSocket.Server;
    private httpMWs;
    private wsMWs;
    closeAsync(code?: number, reason?: string): Promise<void>;
    private static isWebSocket;
    private makeWebSocket;
    protocols<NewStateT = {}, NewCustomT = {}>(): (ctx: ParameterizedContext<StateT & NewStateT, CustomT & NewCustomT>, next: () => Promise<void>) => Promise<void>;
    http<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, CustomT & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
    ws<NewStateT = {}, NewCustomT = {}>(f: Middleware<StateT & NewStateT, Upgraded<CustomT> & NewCustomT>): KoaWsFilter<StateT & NewStateT, CustomT & NewCustomT>;
}
