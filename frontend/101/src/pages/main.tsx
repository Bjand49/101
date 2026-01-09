import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import { startGame, createGame, getGames, getGame, joinGame, leaveGame } from '../hooks/useLobby';
import type { Player } from '../models/Player';
import { getPlayer, setPlayerName } from '../services/playerService';
import GameJoinButton from '../components/gameJoinButton';
import { useColorMode } from '../components/ui/color-mode';
import { Input } from '@chakra-ui/react';
import { useSignalRConnection } from '../hooks/useSignalRConnection';


export default function MainPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [player, setPlayer] = useState<Player>(getPlayer());
    const [canJoinGame, setCanJoinGame] = useState<boolean>(false);
    const { toggleColorMode, colorMode } = useColorMode();

    useSignalRConnection({
        onGameCreated: async (gameId: string) => {
            const res = await getGame(gameId);
            if (!res.data) return;
            setGames(prev => {
                if (prev.some(g => g.id === res.data!.id)) return prev;
                return [...prev, res.data!];
            });
        },
        onGamePlayerUpdate: async (players: Player[], gameId: string) => {
            setGames(prev => prev.map(g => g.id === gameId ? { ...g, players: players } : g));
        },
        onGameStart: async (gameId: string) => {
            console.log("triggered onGameStart for gameId:", gameId);
            const game = games.find(g => g.id === gameId);
            if (!game) return;
            if (game.players.some(p => p.id === player.id)) {
                console.log(`Player ${player.id} is starting game ${gameId}`);
                // Navigate to game page with query parameter
                globalThis.location.href = `/game?gameId=${encodeURIComponent(gameId)}`;
            }
            else {
                setGames(prev => prev.filter(g => g.id !== gameId));
            }
        }

    });

    useEffect(() => {
        const init = async () => {
            const playertemp = getPlayer();
            setPlayer(playertemp);
            const data = await getGames();
            if (data.data) {
                setGames(data.data);
                let foundPlayerInGame = false;
                for (const g of data.data) {
                    if (g.players.some(p => p.id == playertemp.id)) {
                        foundPlayerInGame = true;
                        break;
                    }
                }
                setCanJoinGame(!foundPlayerInGame);
                console.log("canJoinGame:", !foundPlayerInGame);
            }
        };
        init();
        if (colorMode === "dark") {
            toggleColorMode();
        }

    }, []);

    const newGame = async () => {
        const data = (await createGame());
        if (data.error) {
            console.error(data.error);
            return;
        }
        const id = data.data;
        const game = (await getGame(id!)).data;
        if (games.some(g => g.id === game!.id)) {
            return;
        }
        setGames([...games, game!]);
    };
    const attemptStartGame = async (gameid: string) => {
        startGame(gameid);
    };

    const attemptJoinGame = (gameid: string) => {
        joinGame(gameid, player);
        setCanJoinGame(false);
    }

    const attemptLeaveGame = (gameid: string) => {
        leaveGame(gameid, player.id);
        setCanJoinGame(true);
    }

    return (
        <div className="p-8">
            <div>
                <span className="font-semibold">Player ID:</span> {player.id} <br />
                <span className="font-semibold">Player Name:</span> {player.name || 'Unnamed Player'}
                <br />
                <Input
                    type="text"
                    value={player.name}
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                />
                <button onClick={async () => {
                    await setPlayerName(player.name);
                    setPlayer({ ...player });
                }}>save name</button>
                {canJoinGame && <p className="text-red-500">true</p>}
                {!canJoinGame && <p className="text-red-500">false</p>}
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
                            {game.players.map(p => {
                                //we want to add a comma to each name, except the last one. additionally we want to highlight the current player
                                const isCurrentPlayer = p.id === player.id;
                                const playerName = p.name || 'Unnamed Player';
                                return (
                                    <span
                                        key={p.id}
                                        className={isCurrentPlayer ? 'font-bold' : ''}
                                        style={isCurrentPlayer ? { color: '#38A169' } : undefined}
                                    >
                                        {playerName}{game.players[game.players.length - 1].id === p.id ? '' : ', '}
                                    </span>
                                );


                            })}
                        </h3>
                    </div>
                    <GameJoinButton
                        game={game}
                        player={player}
                        canJoinGame={canJoinGame}
                        onJoin={attemptJoinGame}
                        onLeave={attemptLeaveGame}
                        onStart={attemptStartGame}
                    />
                </div>
            ))}
        </div>
    );
}