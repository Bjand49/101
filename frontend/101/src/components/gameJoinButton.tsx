import { Button } from "@chakra-ui/react";
import type { Game } from "../models/Game";
import type { Player } from "../models/Player";

interface GameJoinButtonProps {
    game: Game;
    player: Player;
    canJoinGame: boolean;
    onJoin: (game: string) => void;
    onLeave: (game: string) => void;
    onStart: (game: string) => void;
}

export default function GameJoinButton({
    game,
    player,
    canJoinGame,
    onJoin,
    onLeave,
    onStart,
}: Readonly<GameJoinButtonProps>) {
    const isPlayerInGame = game.players.some((p) => p.id === player.id);
    const isJoinDisabled = game.players.length >= 4 || !canJoinGame;
    const isLeaveDisabled = !isPlayerInGame;
    const isGameStartDisabled = (game.players.length < 2 && isPlayerInGame) || !isPlayerInGame;

    return (
        <div>
            <Button
                disabled={isJoinDisabled}
                onClick={() => onJoin(game.id)}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Join game
            </Button>
            <Button
                disabled={isLeaveDisabled}
                onClick={() => onLeave(game.id)}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Leave game
            </Button>
            <Button
                disabled={isGameStartDisabled}
                onClick={() => onStart(game.id)}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Start game {isGameStartDisabled && '(need at least 2 players)'}
            </Button>
        </div>
    );
}

