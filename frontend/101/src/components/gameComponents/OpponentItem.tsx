import { useEffect, useState } from "react";
import type { Card } from "../../models/Card";
import { VStack } from "@chakra-ui/react";
import { CardDisplay } from "./CardDisplay";
import type { Player } from "../../models/Player";

interface OpponentItemProps {
    player: Player | null;
}
export const OpponentItem = ({ player }: OpponentItemProps) => {
    const [displayedDiscardCard, setDisplayedDiscardCard] = useState<Card | null>(null);
    useEffect(() => {
        if (!player) {
            setDisplayedDiscardCard(null);
            return;
        }

        if (player.discardCard1) {
            setDisplayedDiscardCard(player.discardCard1);
        } else if (player.discardCard2) {
            setDisplayedDiscardCard(player.discardCard2);
        } else {
            setDisplayedDiscardCard(null);
        }
    }, [player]);
    return (
        <div>
            {player ? (
                <div>
                    <VStack>
                        <div>{player.name}</div>
                        <div>
                            {displayedDiscardCard ? (
                                <CardDisplay number={displayedDiscardCard.number} suit={displayedDiscardCard.suit} />
                            ) : (
                                <div>No Discarded Cards</div>
                            )}
                        </div>
                    </VStack>
                </div>
            ) : (
                <div>Empty Slot</div>
            )}
        </div>
    );
};