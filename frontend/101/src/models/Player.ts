import type { Card } from './Card';

export interface Player {
    id: string;
    name: string;
    discardCard1?: Card | null
    discardCard2?: Card | null;
}
