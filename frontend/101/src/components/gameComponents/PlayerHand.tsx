import React, { useEffect, useState } from 'react';
import type { Card } from '../../models/Card';
import { CardSlot } from './CardSlot';
import {
    DndContext,
    type DragEndEvent,
    pointerWithin,
    type CollisionDetection,
} from '@dnd-kit/core';
import DroppableDivider from './DroppableDivider';
import { Button, HStack } from "@chakra-ui/react"
import { toaster } from '../ui/toaster';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface PlayerHandProps {
    cards: Card[];
    playerId: string;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, playerId }) => {
    const [animationParent] = useAutoAnimate({duration: 80, easing: 'ease-in-out' });
    const [slots, setSlots] = useState<(Card | null)[]>(() => {
        const arr: (Card | null)[] = new Array(20).fill(null);
        const limit = 15;
        for (let i = 0; i < limit; i++) {
            arr[i] = cards[i];
        }
        return arr;
    });
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const fromId = event.active.data.current?.fromIndex as number | undefined;
        const overId = event.over?.id as string | undefined;
        console.log(`Drag ended from ${fromId} to ${overId}`);
        if (fromId === undefined || overId === undefined) return;
        if (Number.parseInt(overId) === -1 && fromId === -1) return;

        if (Number.parseInt(overId) === -1) {
            const card = slots[fromId] as Card;
            setCardToPlay(card);
            setSlots(prev => {
                const next = [...prev];
                next[fromId] = cardToPlay;
                return next;
            });
            return;
        }
        if (fromId == null || overId == null || fromId.toString() === overId) return;
        setSlots(prev => {
            const next = [...prev];
            const movingCard = fromId === -1 ? cardToPlay : next[fromId];
            next[fromId] = null;
            if (!movingCard) return prev;

            // If it starts with D, it's a divider, not a slot
            if (overId.toString().includes('D')) {
                const dividerId = Number.parseInt(overId.toString().split('-')[1]);
                let goingRight: boolean | undefined;

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
                    const shouldBreak = indexValue === fromId || next[indexValue] === null;
                    if (tempcard1 === null) {
                        tempcard1 = next[indexValue];
                    }
                    else {
                        tempcard2 = tempcard1;
                        tempcard1 = next[indexValue];
                        next[indexValue] = tempcard2;
                    }
                    if (shouldBreak) break;
                    indexValue = indexValue + increment;
                }
                next[goingRight ? dividerId : dividerId - 1] = movingCard;
            }
            else {
                const overIdNum = Number.parseInt(overId);
                next[fromId] = next[overIdNum];
                next[overIdNum] = movingCard;
            }
            if (fromId === -1) {
                setCardToPlay(null);
            }
            return next;
        });
    };

    const cardElements = [];
    for (let i = 0; i < 10; i++) {
        const card = slots[i];
        cardElements.push(
            <DroppableDivider key={`divider-${i}`} id={`D1-${i}`} />
            ,
            <CardSlot
                key={card ? `card-${card.suit}-${card.number}-${i}` : `empty-slot-${i}`}
                index={i}
                card={card}
            />
        );
    }
    const [cardsInHandCount, setCardsInHandCount] = useState<number>(0);
    useEffect(() => {
        const deckCards = slots.reduce((acc, card) => card ? acc + 1 : acc, 0);
        const cardOutsideOfHand = cardToPlay ? 1 : 0;
        setCardsInHandCount(deckCards + cardOutsideOfHand);
    }, [slots, cardToPlay]);
    cardElements.push(
        <DroppableDivider key={`divider-${20}`} id={`D1-${10}`} />);

    for (let i = 10; i < 20; i++) {
        const card = slots[i];
        cardElements.push(
            <DroppableDivider key={`divider-${i}`} id={`D2-${i}`} />
            ,
            <CardSlot
                key={card ? `card-${card.suit}-${card.number}-${i}` : `empty-slot-${i}`}
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
    const playCard = () => {
        if (cardToPlay) {
            console.log("Playing card:", cardToPlay);
            setCardToPlay(null);
        }
    };

    const declareHand = () => {
        if (slots.reduce((acc, card) => card ? acc + 1 : acc, 0) === 15) {
            toaster.create({
                description: "You need to discard a card before declaring your hand.",
                type: "warning",
            });
            return;
        }
        // gather cards into groups
        let groups = new Array<Array<Card>>();
        const getCards = (cards: Array<Card>) => {
            let temp = new Array<Card>();
            for (const item of cards) {
                if (item) {
                    temp.push(item);
                }
                else if (temp.length > 0) {
                    groups.push(temp);
                    temp = new Array<Card>();

                }
            }
            if (temp.length > 0) {
                groups.push(temp);
            }
        }
        getCards(slots.slice(0, 10) as Array<Card>);
        getCards(slots.slice(10, 20) as Array<Card>);


        console.log("Declared hand with groups:", groups);
        console.log(playerId);
    };
    const drawCard = (drawFromDeck: boolean) => {
        if (cardToPlay && cardsInHandCount === 14) {
            let drawnCard: Card | undefined;
            if (drawFromDeck) {
                drawnCard = { number: 1, suit: "diamond" } as Card; //draw from deck hook
            }
            else {
                //draw from discard pile hook
            }
            return drawnCard;
        }
    };

    return (
        <DndContext
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
        >
            <HStack mb={4}>

                <CardSlot index={-1} card={cardToPlay} />
                <Button disabled={cardsInHandCount === 15} onClick={() => drawCard(false)}>Draw from discarded pile</Button>
                <Button disabled={cardsInHandCount === 15} onClick={() => drawCard(true)}>Draw from pile</Button>
                <Button disabled={cardToPlay === null || cardsInHandCount === 14} onClick={playCard}>Play Card</Button>
                <Button disabled={cardsInHandCount === 14} onClick={declareHand}>Declare hand</Button>
            </HStack>
            <br />
            <div
                ref={animationParent}
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
}