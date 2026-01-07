import type { Card } from "../models/Card";
import ApiClient from "../services/apiClient";

const apiClient = new ApiClient();
// POST /games
export const getGameHand = (gameId: string, playerId: string) =>
    apiClient.get<Card[]>(`/games/${gameId}/${playerId}/hand`);

export const playCard = (gameId: string, playerId: string, card: Card) =>
    apiClient.post<Card, Card>(`/games/${gameId}/${playerId}/hand/play`, card);

export const drawCard = (gameId: string, playerId: string) =>
    apiClient.post<undefined, Card>(`/games/${gameId}/${playerId}/hand/draw`, undefined);

export const drawDiscardedCard = (gameId: string, playerId: string, discardedPlayerId: string) =>
    apiClient.post<string, Card>(`/games/${gameId}/${playerId}/hand/drawdiscard`, discardedPlayerId);

export const declareHand = (gameId: string, playerId: string, cards: Array<Array<Card>> ) =>
    apiClient.post<Array<Array<Card>>, Array<Array<Card>>>(`/games/${gameId}/${playerId}/hand/declare`, cards);