import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import { PlayerHand } from '../components/gameComponents/PlayerHand';
import { toaster, Toaster } from '../components/ui/toaster';
import { Button } from '@chakra-ui/react';
import type { Response } from "../services/apiClient";
import { playCard, drawCard, drawDiscardedCard, declareHand } from '../hooks/useGame';

export default function TestGamePage() {

    const [game, setGame] = useState<Game | null>(null);
    const [isMyTurn, setisMyTurn] = useState<boolean>(false);
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);
    const [hand, setHandState] = useState<Card[]>([]);
    const setHand = (): Card[] => {
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const result: Card[] = [];

        while (result.length < 15) {
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
        setHandState(cards);
        const player: Player = { id: "test-player", name: "Test Player" };
        setGame({ id: "test-game", players: [player], cards: cards, activePlayerId: player.id, activePlayers: 1 });
    }, []);

    const callPlayCard = async (cardToPlay: Card | null) => {
        if (cardToPlay) {
            const response = await playCard(game?.id!, game?.players[0].id!, cardToPlay);
            if (response.error || !response.data) {
                toaster.create({
                    description: "Error playing card. Please try again.",
                    type: "error",
                });
                return;
            }
            setCardToPlay(null);
        }
    };

    const callDeclareHand = async (groups: Card[][]) => {
        if (groups.length == 0) {
            toaster.create({
                description: "You need to discard a card before declaring your hand.",
                type: "warning",
            });
            return;
        }
        const result = await declareHand(game?.id!, game?.players[0].id!, groups);
        if (result.error || !result.data) {
            toaster.create({
                description: "Error declaring hand.",
                type: "error",
            });
            return;
        }
        toaster.create({
            description: "Hand declared successfully!",
            type: "success",
        });
    };

    const callDrawCard = async (drawFromDeck: boolean, cardToPlay: Card | null, cardsInHandCount: number) => {
        if (cardToPlay && cardsInHandCount === 14) {
            let drawnCard: Response<Card>;
            if (drawFromDeck) {
                drawnCard = await drawCard(game?.id!, game?.players[0].id!)
            }
            else {
                drawnCard = await drawDiscardedCard(game?.id!, game?.players[0].id!, game?.players[0].id!);
            }
            if (drawnCard.error || !drawnCard.data) {
                toaster.create({
                    description: "Error drawing card.",
                    type: "error",
                });
                return;
            }
            setCardToPlay(drawnCard.data);
        }
    };

    return (
        <div className="test-game-page">
            <Button onClick={() => setisMyTurn(!isMyTurn)} mb={4}>Toggle turn</Button>
            <Toaster />
            <h1>Test Game Page</h1>
            {hand && (
                <div>
                    <h2>Player Hand:</h2>
                    <PlayerHand cards={hand} isMyTurn={isMyTurn} callDeclareHand={callDeclareHand} callDrawCard={callDrawCard} callPlayCard={callPlayCard} playedCard={cardToPlay}/>
                </div>
            )}
        </div>
    )
};