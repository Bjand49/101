import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;
const meta = {} as any;
const handlers = new Map<string, Set<(...args: any[]) => void>>();

const createConnection = (): signalR.HubConnection => {
    // Optionally force WebSockets transport and skip negotiate if configured
    const forceWs =  'true';
    const url = 'http://192.168.4.23:5000/gamehub';
    const options: any = {};
    if (forceWs) {
        options.transport = signalR.HttpTransportType.WebSockets;
        // skip negotiation when using WebSockets-only (server must support it)
        options.skipNegotiation = true;
    }

    const newConn = new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    return newConn;
};

export const getSignalRConnection = (): signalR.HubConnection => {
    if (connection) return connection;
    connection = createConnection();
    return connection;
};

export const startConnection = async (): Promise<void> => {
    const conn = getSignalRConnection();

    if (conn.state !== signalR.HubConnectionState.Disconnected) {
        return;
    }

    if (meta._starting) return;
    meta._starting = true;
    try {
        const maxAttempts = 4;
        const baseDelay = 800;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await conn.start();
                console.log('SignalR connected');
                break;
            } catch (err) {
                console.warn(`SignalR start attempt ${attempt} failed:`, err);
                if (attempt === maxAttempts) {
                    console.error('SignalR failed to start after max attempts.');
                    break;
                }
                const jitter = Math.floor(Math.random() * 300);
                const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
                await new Promise(res => setTimeout(res, delay));
            }
        }
    } finally {
        meta._starting = false;
    }
};

export const on = (event: string, handler: (...args: any[]) => void | Promise<void>): void => {
    const conn = getSignalRConnection();

    // Add handler to registry
    if (!handlers.has(event)) {
        handlers.set(event, new Set());
        
        // Attach the event to SignalR connection only once per event
        conn.on(event, async (...args: any[]) => {
            const eventHandlers = handlers.get(event);
            if (!eventHandlers) return;
            
            for (const handler of eventHandlers) {
                try {
                    handler(...args);
                } catch (err) {
                    console.error(`Error in handler for '${event}':`, err);
                }
            }
        });
    }

    handlers.get(event)!.add(handler);
};

export const off = (event: string, handler: (...args: any[]) => void | Promise<void>): void => {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
        eventHandlers.delete(handler);
    }
};
