import { v4 as uuidv4 } from 'uuid';
import type { Player } from '../models/Player';

const PLAYER_KEY = 'player';

let player: Player | null = null;


export const getPlayerId = async (): Promise<Player> => {
    if (player) return player;

    // Try to retrieve from localStorage
    const stored = localStorage.getItem(PLAYER_KEY);
    if (stored) {
        player = JSON.parse(stored) as Player;
        return player;
    }

    // Generate new UUID
    player = { name: '', id: uuidv4(), hand: [], discardPile: [] };
    setPlayer(player);
    console.log('Generated new player ID:', player);

    return player;
};

export const setPlayerName = async (name: string): Promise<void> => {
    player ??= await getPlayerId();
    player.name = name;
    setPlayer(player);
}

export const clearPlayerId = (): void => {
    player = null;
    localStorage.removeItem(PLAYER_KEY);
};
const setPlayer = (playerData: Player): void => {
    player = playerData;
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}