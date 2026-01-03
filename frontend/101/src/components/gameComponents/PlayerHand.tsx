import React, { useState } from 'react';
import type { Card } from '../../models/Card';
import { CardSlot } from './CardSlot';
import {
    DndContext,
    type DragEndEvent,
    pointerWithin,
    type CollisionDetection,
} from '@dnd-kit/core';
import DroppableDivider from './DroppableDivider';

interface PlayerHandProps {
    cards: Card[];
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards }) => {
    const [slots, setSlots] = useState<(Card | null)[]>(() => {
        const arr: (Card | null)[] = new Array(20).fill(null);
        const limit = 14;
        for (let i = 0; i < limit; i++) {
            arr[i] = cards[i];
        }
        return arr;
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const fromId = event.active.data.current?.fromIndex as number | undefined;
        const overId = event.over?.id as string | undefined;

        if (fromId == null || overId == null || fromId.toString() === overId) return;
        setSlots(prev => {
            const next = [...prev];
            const movingCard = next[fromId];
            next[fromId] = null
            if (!movingCard) return prev;

            // If it starts with D, it's a divider, not a slot
            if (overId.toString().includes('D')) {
                const dividerId = Number.parseInt(overId.toString().split('-')[1]);
                let goingRight: boolean | undefined = undefined;

                // Find nearest empty slot
                for (let i = 0; i < next.length; i++) {
                    const startIndex = dividerId - i;
                    const endIndex = dividerId;
                    const hasSpaceOnLeft = startIndex >= 0 && next[startIndex] === null;
                    const hasSpaceOnRight = endIndex < next.length && next[endIndex] === null;
                    if (startIndex < 0 ||
                        (hasSpaceOnLeft && hasSpaceOnRight) ||
                        (hasSpaceOnRight) ||
                        endIndex === fromId) {

                        goingRight ??= true;
                    }
                    else if (endIndex >= next.length ||
                        hasSpaceOnLeft ||
                        startIndex === fromId) {
                        goingRight ??= false;
                    }

                    if (goingRight !== undefined) {
                        break;
                    }

                }

                const increment = goingRight ? 1 : -1;
                let indexValue = goingRight ? dividerId : dividerId - 1;
                let tempcard1: Card | null = null;
                let tempcard2: Card | null = null;

                // Shift cards right to make space at dividerId
                while (true) {
                    if (tempcard1 === null) {
                        tempcard1 = next[indexValue];
                    }
                    else {
                        tempcard2 = tempcard1;
                        tempcard1 = next[indexValue];
                        next[indexValue] = tempcard2;
                    }
                    if (indexValue === fromId || prev[indexValue] === null) break;
                    indexValue = indexValue + increment;
                }
                next[goingRight ? dividerId : dividerId - 1] = movingCard;
                return next;
            }
            else {
                const overIdNum = Number.parseInt(overId);
                next[fromId] = next[overIdNum];
                next[overIdNum] = movingCard;
                return next;
            }
        });
    };

    const cardElements = [];
    for (let i = 0; i < 10; i++) {
        const card = slots[i];
        cardElements.push(
            <DroppableDivider key={`divider-${i}`} id={`D1-${i}`} />
            ,
            <CardSlot
                key={i}
                index={i}
                card={card}
            />
        );
    }
    cardElements.push(
        <DroppableDivider key={`divider-${20}`} id={`D1-${10}`} />);
    for (let i = 10; i < 20; i++) {
        const card = slots[i];
        cardElements.push(
            <DroppableDivider key={`divider-${i}`} id={`D2-${i}`} />
            ,
            <CardSlot
                key={i}
                index={i}
                card={card}
            />
        );
    }
    cardElements.push(
        <DroppableDivider key={`divider-${20}`} id={`D2-${20}`} />);

    const collisionDetection: CollisionDetection = (args) => {
        // Prefer the slot directly under the pointer
        const pointerCollisions = pointerWithin(args);
        return pointerCollisions;
    };
    const topRow = cardElements.slice(0, 21);
    const bottomRow = cardElements.slice(21, 42);

    return (
        <DndContext
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(21, auto)',
                    gap: '0px',
                    justifyContent: 'center',
                }}
            >

                {/* Generate top row */}
                {topRow}
                {/* Generate bottom row */}
                {bottomRow}
            </div>
        </DndContext>
    );
};