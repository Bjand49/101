import type { Game } from "../models/Game";
import type { Player } from "../models/Player";

interface GameJoinButtonProps {
	game: Game;
	player: Player;
	canJoinGame: boolean;
	onJoin: (game: string) => void;
	onLeave: (game: string) => void;
}

export default function GameJoinButton({
	game,
	player,
	canJoinGame,
	onJoin,
	onLeave,
}: Readonly<GameJoinButtonProps>) {
	const isPlayerInGame = game.players.some((p) => p.id === player.id);
	const isJoinDisabled = game.players.length >= 4 || !canJoinGame;
	const isLeaveDisabled = game.players.length === 0 || !isPlayerInGame;

	return (
		<div>
			<button
				disabled={isJoinDisabled}
				onClick={() => onJoin(game.id)}
				className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Join game
			</button>
			<button
				disabled={isLeaveDisabled}
				onClick={() => onLeave(game.id)}
				className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Leave game
			</button>
		</div>
	);
}

