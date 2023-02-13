import WebSocket = require('ws');
import { Middleware, DefaultContext, DefaultState } from 'koa';
export type Upgraded<ContextT> = ContextT & {
    upgrade: () => Promise<WebSocket>;
};
export declare class KoaWsFilter<StateT = DefaultState, ContextT = DefaultContext> {
    wsServer: WebSocket.Server<WebSocket.WebSocket>;
    private httpMws;
    private wsMws;
    close(code?: number, reason?: string): Promise<void>;
    private static isWebSocket;
    private makeWebSocket;
    protocols(): Middleware<StateT, Upgraded<ContextT>>;
    http<NewStateT = {}, NewContextT = {}>(middleware: Middleware<StateT & NewStateT, ContextT & NewContextT>): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT>;
    ws<NewStateT = {}, NewContextT = {}>(middleware: Middleware<StateT & NewStateT, Upgraded<ContextT> & NewContextT>): KoaWsFilter<StateT & NewStateT, ContextT & NewContextT>;
}
