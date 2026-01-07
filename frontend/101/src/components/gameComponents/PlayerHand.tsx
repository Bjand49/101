import React, { useEffect, useState } from 'react';
import type { Card } from '../../models/Card';
import { CardSlot } from './CardSlot';
import {
    DndContext,
    type DragEndEvent,
    pointerWithin,
} from '@dnd-kit/core';
import DroppableDivider from './DroppableDivider';
import { Button, HStack } from "@chakra-ui/react"
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface PlayerHandProps {
    cards: Card[];
    isMyTurn?: boolean;
    playedCard: Card | null;
    callDrawCard: (drawFromDeck: boolean, cardToPlay: Card | null, cardsInHandCount: number) => Promise<void>;
    callPlayCard: (card: Card | null) => Promise<void>;
    callDeclareHand: (cards: Card[][]) => Promise<void>;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, isMyTurn, playedCard, callDeclareHand, callDrawCard, callPlayCard }) => {
    const [animationParent] = useAutoAnimate({ duration: 80, easing: 'ease-in-out' });
    const [cardsInHandCount, setCardsInHandCount] = useState<number>(0);
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);
    const [slots, setSlots] = useState<(Card | null)[]>(() => {
        const arr: (Card | null)[] = new Array(20).fill(null);
        const limit = 15;
        for (let i = 0; i < limit; i++) {
            arr[i] = cards[i];
        }
        return arr;
    });

    useEffect(() => {
        const deckCards = slots.reduce((acc, card) => card ? acc + 1 : acc, 0);
        const cardOutsideOfHand = cardToPlay ? 1 : 0;
        setCardsInHandCount(deckCards + cardOutsideOfHand);
    }, [slots, cardToPlay]);

    useEffect(() => {
        setCardToPlay(playedCard);
    }, [playedCard]);


    const handleDragEnd = (event: DragEndEvent) => {
        const fromId = event.active.data.current?.fromIndex as number | undefined;
        const overId = event.over?.id as string | undefined;

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

        if (fromId == undefined || overId == undefined || fromId.toString() === overId) return;
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

    const createCardElements = (startIndex: number, endIndex: number, dividerPrefix: string) => {
        const elements = [];
        for (let i = startIndex; i < endIndex; i++) {
            const card = slots[i];
            elements.push(
                <DroppableDivider key={`divider-${i}`} id={`${dividerPrefix}-${i}`} />,
                <CardSlot
                    key={card ? `card-${card.suit}-${card.number}-${i}` : `empty-slot-${i}`}
                    index={i}
                    card={card}
                />
            );
        }
        elements.push(
            <DroppableDivider key={`divider-${endIndex}`} id={`${dividerPrefix}-${endIndex}`} />
        );
        return elements;
    };

    const gatherCards = () => {
        if (slots.reduce((acc, card) => card ? acc + 1 : acc, 0) === 15) {
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

        callDeclareHand(groups);
    };

    const topRow = createCardElements(0, 10, 'D1');
    const bottomRow = createCardElements(10, 20, 'D2');

    return (
        <DndContext
            collisionDetection={pointerWithin}
            onDragEnd={handleDragEnd}>
            <HStack mb={4}>
                <CardSlot index={-1} card={cardToPlay} />
                <Button disabled={!isMyTurn || cardsInHandCount === 15} onClick={() => callDrawCard(false, cardToPlay, cardsInHandCount)}>Draw from discarded pile</Button>
                <Button disabled={!isMyTurn || cardsInHandCount === 15} onClick={() => callDrawCard(true, cardToPlay, cardsInHandCount)}>Draw from pile</Button>
                <Button disabled={!isMyTurn || cardToPlay === null || cardsInHandCount === 14} onClick={() => callPlayCard(cardToPlay)}>Play Card</Button>
                <Button disabled={!isMyTurn} onClick={gatherCards}>Declare hand</Button>
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