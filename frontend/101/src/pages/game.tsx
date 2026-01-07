import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import { getGame } from '../hooks/useLobby';

export default function GamePage() {
    const searchParams = new URLSearchParams(globalThis.location.search);
    const gameId = searchParams.get('id');
    const [ready, setReady] = useState(false);
    const [game, setGame] = useState<Game | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) {
                setNotFound(true);
                return;
            }

            const res = await getGame(gameId);

            if (!res.data) {
                setNotFound(true);
            } else {
                setGame(res.data);
            }
            setReady(true);

        };

        fetchGame();
    }, [gameId]);

    if(!ready) return <></>;
    if (notFound) {
        return (
            <div className="game-page">
                <h1>404 - Game not found</h1>
                <p>The game you are looking for does not exist.</p>
            </div>
        );
    }

    else if (!game) {
        return (
            <div className="game-page">
                <h1>Error loading game</h1>
            </div>
        );
    }

    return (
        <div className="game-page">
            <h1>Game Page</h1>
            <p>Game ID: {game.id}</p>
            <p>Players: {game.players?.length ?? 0}</p>
        </div>
    );
};

