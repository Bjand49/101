import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import { createGame, getGames, getGame, joinGame } from '../hooks/useGame';
import { useSignalRConnection } from '../hooks/useSignalRConnection';
import type { Player } from '../models/Player';
import { getPlayerId, setPlayerName } from '../services/playerService';


export default function MainPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [player, setPlayer] = useState<Player>({} as Player);
    useSignalRConnection({
        onGameCreated: async (gameId: string) => {
            const res = await getGame(gameId);
            if (!res.data) return;
            setGames(prev => {
                if (prev.find(g => g.id === res.data!.id)) return prev;
                return [...prev, res.data!];
            });
        },
        onUserJoinedGroup: async (players: Player[], gameId: string) => {
            setGames(prev => prev.map(g => g.id === gameId ? { ...g, players: players } : g));
        }
    });

    useEffect(() => {
        const init = async () => {
            setPlayer(await getPlayerId());
            const data = await getGames();
            if (data.data) {
                setGames(data.data);
            }
        };
        init();
    }, []);

    const newGame = async () => {
        const data = (await createGame());
        if (data.error) {
            console.error(data.error);
            return;
        }
        const id = data.data;
        const game = (await getGame(id!)).data;
        if (games.find(g => g.id === game!.id)) {
            return;
        }
        setGames([...games, game!]);
    };


    return (
        <div className="p-8">
            <div>
                <span className="font-semibold">Player ID:</span> {player.id} <br />
                <span className="font-semibold">Player Name:</span> {player.name || 'Unnamed Player'}
                <br />
                <input 
                    type="text" 
                    value={player.name} 
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })} 
                />
                <button onClick={async () => {
                    await setPlayerName(player.name);
                    setPlayer({ ...player }); // Update the state to reflect the new name
                }}>save name</button>
            </div>
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
                        <h3 className="text-xl font-semibold">ActivePlayers: 
                            {game.players.map(p => p.name).join(", ")}
                        </h3>
                    </div>
                    <div>
                        <button
                            onClick={() => joinGame(game.id, player)}
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