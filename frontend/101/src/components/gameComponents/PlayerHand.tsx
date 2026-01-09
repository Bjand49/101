import React, { useEffect, useState } from 'react';
import type { Card } from '../../models/Card';
import { CardSlot } from './CardSlot';
import {
    DndContext,
    type DragEndEvent,
    pointerWithin,
    closestCenter,
    TouchSensor,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import DroppableDivider from './DroppableDivider';
import { Button, HStack } from "@chakra-ui/react"
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface PlayerHandProps {
    cards: Card[];
    isMyTurn: boolean;
    playedCard: Card | null;
    hasDrawnCardThisTurn: boolean;
    callDrawCard: (drawFromDeck: boolean, playedCard: Card | null, cardsInHandCount: number) => Promise<void>;
    callPlayCard: (card: Card | null) => Promise<void>;
    callDeclareHand: (cards: Card[][]) => Promise<void>;
    setplayedCard: (card: Card | null) => void;
}

export const PlayerHand = ({ cards, isMyTurn, playedCard, hasDrawnCardThisTurn, callDrawCard, callPlayCard, callDeclareHand, setplayedCard }: PlayerHandProps) => {
    const [animationParent] = useAutoAnimate({ duration: 80, easing: 'ease-in-out' });
    const [cardsInHandCount, setCardsInHandCount] = useState<number>(0);
    const [slots, setSlots] = useState<(Card | null)[]>(() => {
        const arr: (Card | null)[] = new Array(20).fill(null);
        const limit = 15;
        for (let i = 0; i < limit; i++) {
            arr[i] = cards[i];
        }
        return arr;
    });

    // Configure sensors for better touch/mobile support
    const sensors = useSensors(
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 8,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        const deckCards = slots.reduce((acc, card) => card ? acc + 1 : acc, 0);
        const cardOutsideOfHand = playedCard ? 1 : 0;
        setCardsInHandCount(deckCards + cardOutsideOfHand);
        console.log("playedCard changed123132:", playedCard);

    }, [slots, playedCard]);




    const handleDragEnd = (event: DragEndEvent) => {
        const fromId = event.active.data.current?.fromIndex as number | undefined;
        const overId = event.over?.id as string | undefined;

        if (fromId === undefined || overId === undefined) return;
        if (Number.parseInt(overId) === -1 && fromId === -1) return;

        if (Number.parseInt(overId) === -1) {
            const card = slots[fromId] as Card;
            setplayedCard(card);
            setSlots(prev => {
                const next = [...prev];
                next[fromId] = playedCard;
                return next;
            });
            return;
        }

        if (fromId == undefined || overId == undefined || fromId.toString() === overId) return;
        setSlots(prev => {
            const next = [...prev];
            const movingCard = fromId === -1 ? playedCard : next[fromId];
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
                setplayedCard(null);
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
    const playerStyle = {
        border: isMyTurn ? '5px solid green' : '5px solid black',
        borderRadius: '10px',
        padding: '10px',
        margin: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(21, auto)',
        gap: '0px',
        justifyContent: 'center',

    };
    return (

        <DndContext
            sensors={sensors}
            autoScroll={false}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <HStack mb={4}>
                <p>Cards in hand: {cardsInHandCount}</p>
                <p>Is my turn: {isMyTurn ? 'true' : 'false'}</p>
                <Button disabled={hasDrawnCardThisTurn || !isMyTurn || cardsInHandCount === 15} onClick={() => callDrawCard(false, playedCard, cardsInHandCount)}>Draw from discarded pile</Button>
                <Button disabled={hasDrawnCardThisTurn || !isMyTurn || cardsInHandCount === 15} onClick={() => callDrawCard(true, playedCard, cardsInHandCount)}>Draw from pile</Button>
                <Button disabled={!hasDrawnCardThisTurn || !isMyTurn || cardsInHandCount !== 15} onClick={() => callPlayCard(playedCard)}>Play Card</Button>
                <Button disabled={!hasDrawnCardThisTurn || !isMyTurn} onClick={gatherCards}>Declare hand</Button>
                <CardSlot index={-1} card={playedCard} />
            </HStack>
            <br />
            <div
                ref={animationParent}
                style={playerStyle}
            >
                {/* Generate top row */}
                {topRow}
                {/* Generate bottom row */}
                {bottomRow}
            </div>
        </DndContext>
    );
}