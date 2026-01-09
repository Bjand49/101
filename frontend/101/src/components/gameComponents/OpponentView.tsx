import { useEffect, useState } from "react";
import type { Player } from "../../models/Player";
import { OpponentItem } from "./OpponentItem";
import { HStack } from "@chakra-ui/react";

interface OpponentViewProps {
    players: Player[];
    activePlayerId?: string;
}

export const OpponentView = ({ players: opponents, activePlayerId }: OpponentViewProps) => {
    // Always show 4 slots, padding with empty slots if needed
    const getItemStyle = (isActive: boolean) => ({
        border: isActive ? '5px solid green' : '5px solid black',
        borderRadius: '10px',
        padding: '10px',
        width: '200px',
        height: '250px',
        margin: '10px'
    });

    return (
        <div>
            <HStack>
                {[...opponents, ...new Array(4 - opponents.length).fill(null)].map((opponent, index) => (
                    <div key={opponent?.id || index} style={getItemStyle(opponent?.id === activePlayerId)}>
                        <OpponentItem player={opponent} />
                    </div>
                ))}
            </HStack>
        </div>
    );
};