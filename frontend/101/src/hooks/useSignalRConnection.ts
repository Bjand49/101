import { useEffect } from 'react';
import { startConnection, on, off } from '../services/signalRService';
import type { Player } from '../models/Player';

interface SignalRHandlers {
    onGameCreated?: (gameId: string) => Promise<void>;
    onUserJoinedGroup?: (players: Player[], gameId: string) => Promise<void>;
}

export const useSignalRConnection = (handlers: SignalRHandlers) => {
    useEffect(() => {
        void startConnection();

        // Register handlers
        if (handlers.onGameCreated) {
            on('GameCreated', handlers.onGameCreated);
        }
        if (handlers.onUserJoinedGroup) {
            on('UserJoinedGroup', handlers.onUserJoinedGroup);
        }

        // Cleanup: unregister handlers on unmount
        return () => {
            if (handlers.onGameCreated) {
                off('GameCreated', handlers.onGameCreated);
            }
            if (handlers.onUserJoinedGroup) {
                off('UserJoinedGroup', handlers.onUserJoinedGroup);
            }
        };
    }, [handlers]);
};
