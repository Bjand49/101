import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import { PlayerHand } from '../components/gameComponents/PlayerHand';

export default function TestGamePage() {

    const [game, setGame] = useState<Game | null>(null);

    const setHand = (): Card[] => {
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const result: Card[] = [];

        while (result.length < 14) {
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const number = Math.floor(result.length) + 1;

            const alreadyPicked = result.some(
                (c) => c.suit === suit && c.number === number
            );
            if (!alreadyPicked) {
                result.push({ suit, number });
            }
        }
        return result;

    }
    useEffect(() => {
        const cards = setHand();
        console.log("Generated hand:", cards);
        const player: Player = { id: "test-player", name: "Test Player", hand: cards, discardPile: [] };
        setGame({ id: "test-game", players: [player], cards: cards, activePlayerId: player.id, activePlayers: 1 });
    }, []);
    return (
        <div className="test-game-page">
            <h1>Test Game Page</h1>
            {game?.players[0]?.hand && (
                <div>
                    <h2>Player Hand:</h2>
                    <PlayerHand cards={game?.players[0].hand}/>
                </div>
            )}
        </div>
    )

};

