import type { Card } from './Card';
import type { Player } from './Player';

export interface Game {
    id: string;
    players: Player[];
    cards: Card[];
    activePlayerId: string;
    activePlayers: number;
}