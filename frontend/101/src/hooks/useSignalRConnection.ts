import { useEffect } from 'react';
import { startConnection, on, off } from '../services/signalRService';
import type { Player } from '../models/Player';

interface SignalRHandlers {
    onGameCreated?: (gameId: string) => Promise<void>;
    onGamePlayerUpdate?: (players: Player[], gameId: string) => Promise<void>;
    onGameStart?: (gameId: string) => Promise<void>;
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

        // Cleanup: unregister handlers on unmount
        return () => {
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
