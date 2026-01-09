import { useMemo } from 'react';
import { getPlayer as getPlayer } from '../services/playerService';
import type { Player } from '../models/Player';

/**
 * Hook to get the current player's ID.
 * Memoized to avoid unnecessary re-renders.
 */
export const usePlayer = (): Player => {
    return useMemo(() => getPlayer(), []);
};


