import { useEffect, useState } from 'react';
import type { Game } from '../models/Game';
import type { Card } from '../models/Card';
import type { Response } from "../services/apiClient";
import { getGame } from '../hooks/useLobby';
import { getGameHand, playCard, declareHand, drawCard, drawDiscardedCard } from '../hooks/useGame';
import { HStack } from '@chakra-ui/react';
import { PlayerHand } from '../components/gameComponents/PlayerHand';
import { toaster, Toaster } from '../components/ui/toaster';
import { useSignalRConnection } from '../hooks/useSignalRConnection';
import { getPlayer } from '../services/playerService';
import { OpponentView } from '../components/gameComponents/OpponentView';
import type { Player } from '../models/Player';

export default function GamePage() {
    const searchParams = new URLSearchParams(globalThis.location.search);
    const gameId = searchParams.get('gameId');
    const [ready, setReady] = useState(false);
    const [hasDrawnCardThisTurn, setHasDrawnCardThisTurn] = useState(false);
    const [notFound, setNotFound] = useState<string>('');
    const [game, setGame] = useState<Game | null>(null);
    const [isMyTurn, setisMyTurn] = useState<boolean>(false);
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);
    const [hand, setHand] = useState<Card[]>([]);
    const player = getPlayer();

    useSignalRConnection({
        onPlayedCard: async (gameId, playerId, card, nextPlayerId) => {
            if (gameId !== game?.id) return;
            const eventPlayer: Player | undefined = game.players.find(p => p.id === playerId);
            if (!eventPlayer) return;
            toaster.create({
                description: `${eventPlayer.name} played ${card.number} of ${card.suit}.
                It is now ${game.players.find(p => p.id === nextPlayerId)?.name}'s turn.`,
                type: "info",
            });
            setGame(prevGame => {
                if (!prevGame) return prevGame;
                let player: Player | undefined = prevGame.players.find(p => p.id === playerId);
                if (!player) return prevGame;
                player = addCardToDiscard(card, player);
                prevGame.players = prevGame.players.map(p => p.id === playerId ? player : p);
                const players = prevGame.players.map(p =>
                    p.id === playerId
                        ? { ...p, discardCard1: p.discardCard2, discardCard2: card } // adjust logic as needed
                        : p
                );
                return { ...prevGame, players, activePlayerId: nextPlayerId };
            }
            );
            setisMyTurn(nextPlayerId === player.id);
        },
    });

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) {
                setNotFound('Game not found');
                return;
            }

            const gameResponse = await getGame(gameId);

            if (!gameResponse.data) {
                setNotFound(gameResponse.error?.message!);
            } else {
                setGame(gameResponse.data);
            }

            const handResponse = await getGameHand(gameId, player.id);
            if (!handResponse.data) {
                setNotFound(handResponse.error?.message!);
            } else {
                console.log("Fetched hand:", handResponse.data);
                setHand(handResponse.data);
            }

            setReady(true);
            setisMyTurn(gameResponse.data?.activePlayerId === player.id);
            const hasDrawnCardThisTurn = gameResponse.data?.activePlayerId === player.id && handResponse.data?.length == 15;
            setHasDrawnCardThisTurn(!!hasDrawnCardThisTurn);
        };

        fetchGame();
    }, [gameId]);
    const addCardToDiscard = (card: Card, player: Player): Player => {
        if (player.discardCard1) {
            player.discardCard1 = card;
        } else if (player.discardCard2) {
            player.discardCard2 = card;
        } else {
            // Both slots full—shift or replace
            player.discardCard1 = player.discardCard2;
            player.discardCard2 = card;
        }
        return player;
    }

    const callPlayCard = async (cardToPlay: Card | null) => {
        if (cardToPlay) {
            const response = await playCard(game?.id!, player.id, cardToPlay);
            if (response.error || !response.data) {
                toaster.create({
                    description: response.error?.response?.data ?? "Error playing card. Please try again.",
                    type: "error",
                });
                return;
            }
            console.log("Card played successfully:", response.data);
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
        const result = await declareHand(game?.id!, player.id, groups);
        if (result.error || !result.data) {
            toaster.create({
                description: result.error?.response?.data ?? "Error declaring hand. Please try again.",
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
        if (cardToPlay) {
            toaster.create({
                description: "You must play or discard the drawn card before drawing another.",
                type: "warning",
            });
            return;
        }
        if (cardsInHandCount === 14) {
            let drawnCard: Response<Card>;
            if (drawFromDeck) {
                drawnCard = await drawCard(game?.id!, player.id)
            }
            else {
                drawnCard = await drawDiscardedCard(game?.id!, player.id, game?.players[0].id!);
            }
            if (drawnCard.error || !drawnCard.data) {
                toaster.create({
                    description: drawnCard.error?.response?.data ?? "Error drawing card.",
                    type: "error",
                });
                return;
            }
            console.log("Card drawn successfully:", drawnCard.data);
            setHasDrawnCardThisTurn(true);
            setCardToPlay(drawnCard.data);
        }
    };


    if (!ready) return <></>;
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
        <div className="test-game-page">
            <OpponentView players={game.players.filter(x => x.id !== player.id)} activePlayerId={game.activePlayerId} />
            <HStack>

                <Toaster />
                {hand && (
                    <div>
                        <h2>Player Hand:</h2>
                        <PlayerHand cards={hand}
                            isMyTurn={isMyTurn}
                            callDeclareHand={callDeclareHand}
                            callDrawCard={callDrawCard}
                            callPlayCard={callPlayCard}
                            playedCard={cardToPlay}
                            setplayedCard={setCardToPlay}
                            hasDrawnCardThisTurn={hasDrawnCardThisTurn} />
                    </div>
                )}
            </HStack>
        </div>
    );
};

