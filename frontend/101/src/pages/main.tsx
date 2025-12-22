import { useEffect, useState, useRef } from 'react';
import type { Game } from '../models/Game';
import { createGame, getGames, getGame, joinGame } from '../hooks/useGame';
import * as signalR from "@microsoft/signalr";


export default function MainPage() {
    const [games, setGames] = useState<Game[]>([]);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchGames = async () => {
            const data = await getGames();
            if (!mounted) return;
            if (data.data) {
                setGames(data.data);
            }
        };

        const getOrCreateConnection = (): signalR.HubConnection => {
            if (connectionRef.current) return connectionRef.current;

            // Optionally force WebSockets transport and skip negotiate if configured
            const forceWs = import.meta.env.VITE_FORCE_WS === 'true';
            const url = import.meta.env.VITE_BASE_URL ? `${import.meta.env.VITE_BASE_URL}/gamehub` : 'http://localhost:5093/gamehub';
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

            connectionRef.current = newConn;
            return newConn;
        };

        const conn = getOrCreateConnection();
        const meta = conn as any;

        // Attach handlers once (pre-start)
        if (!meta._handlersAttached) {
            meta._handlersAttached = true;

            conn.on("send", (data: any) => {
                console.log('signalR send:', data);
            });

            conn.on('GameCreated', async (gameId: string) => {
                try {
                    const res = await getGame(gameId);
                    if (!res.data) return;
                    setGames(prev => {
                        if (prev.find(g => g.id === res.data!.id)) return prev;
                        return [...prev, res.data!];
                    });
                } catch (err) {
                    console.error('Error handling GameCreated:', err);
                }
            });
            conn.on('UserJoinedGroup', async (count: number, gameId: string) => {
                try {
                    setGames(prev => prev.map(g => g.id === gameId ? { ...g, activePlayers: count } : g));
                } catch (err) {
                    console.error('Error handling userJoined:', err);
                }
            });
            conn.onreconnecting(error => {
                console.warn('SignalR reconnecting', error);
            });
            conn.onreconnected(connectionId => {
                console.log('SignalR reconnected, connectionId=', connectionId);
            });
            conn.onclose(error => {
                console.warn('SignalR closed', error);
            });
        }

        // Start safely with guarded concurrent-start prevention and retries
        const startSafe = async () => {
            if (conn.state !== signalR.HubConnectionState.Disconnected) {
                console.log('SignalR start skipped, state=', conn.state);
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

        fetchGames();
        void startSafe();

        return () => {
            mounted = false;
            // intentionally do not stop a shared/stable connection here to avoid stopping it during StrictMode remounts.
        };
    }, []);

    const newGame = async () => {
        const data = (await createGame());
        if (data.error) {
            console.error(data.error);
            return;
        }
        const id = data.data;
        var game = (await getGame(id!)).data;
        if (games.find(g => g.id === game!.id)) {
            return;
        }
        setGames([...games, game!]);
    };


    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Games</h1>

            <button
                onClick={newGame}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                create game
            </button>

            {games.map((game) => (
                <div key={game.id} className="mb-8 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Game ID: {game.id}</h2>
                        <h3 className="text-xl font-semibold">ActivePlayers: {game.activePlayers}</h3>
                    </div>
                    <div>
                        <button
                            onClick={() => joinGame(game.id, 'asdf')}
                            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            join game
                        </button>

                    </div>
                </div>
            ))}
        </div>
    );
}