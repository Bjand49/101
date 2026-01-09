import { useEffect } from 'react';
import { startConnection, on, off } from '../services/signalRService';
import type { Player } from '../models/Player';
import type { Card } from '../models/Card';

interface SignalRHandlers {
    onGameCreated?: (gameId: string) => Promise<void>;
    onGamePlayerUpdate?: (players: Player[], gameId: string) => Promise<void>;
    onGameStart?: (gameId: string) => Promise<void>;
    onPlayedCard?: (gameId: string, playerId : string, card: Card, nextPlayerId: string) => Promise<void>;
}

export const useSignalRConnection = (handlers: SignalRHandlers) => {
    useEffect(() => {
        void startConnection();

        // Register handlers
        if (handlers.onGameCreated) {
            on('GameCreated', handlers.onGameCreated);
        }
        if (handlers.onGamePlayerUpdate) {
            on('GamePlayerUpdate', handlers.onGamePlayerUpdate);
        }
        if (handlers.onGameStart) {
            on('GameStart', handlers.onGameStart);
        }
        if (handlers.onPlayedCard) {
            on('PlayedCard', handlers.onPlayedCard);
        }

        // Cleanup: unregister handlers on unmount
        return () => {
            if (handlers.onPlayedCard) {
                off('PlayedCard', handlers.onPlayedCard);
            }
            if (handlers.onGameCreated) {
                off('GameCreated', handlers.onGameCreated);
            }
            if (handlers.onGamePlayerUpdate) {
                off('GamePlayerUpdate', handlers.onGamePlayerUpdate);
            }
            if (handlers.onGameStart) {
                off('GameStart', handlers.onGameStart);
            }
        };
    }, [handlers]);
};
