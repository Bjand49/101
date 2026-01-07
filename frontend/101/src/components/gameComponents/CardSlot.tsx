import React from 'react';
import type { Card } from '../../models/Card';
import { CardDisplay } from './CardDisplay';
import { useDroppable, useDraggable } from '@dnd-kit/core';

interface CardSlotProps {
    card?: Card | null;
    index: number;
}

const DraggableCard: React.FC<{ card: Card; index: number }> = ({ card, index }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `card-${index}`,
        data: { fromIndex: index },
    });
    const style: React.CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.15)`
            : undefined,
        cursor: isDragging ? 'grabbing' :'grab',
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <CardDisplay suit={card.suit} number={card.number}/>
        </div>
    );
};

export const CardSlot: React.FC<CardSlotProps> = ({ card, index }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: index,
    });

    const isEmpty = !card;

    const borderColorWhenOver = isEmpty ? '#4caf50' : '#ff9800';
    const borderColor = isOver ? borderColorWhenOver : '#aaa';

    const backgroundColorWhenOver = isEmpty ? '#e8f5e9' : '#fff3e0';
    const backgroundColor = isOver ? backgroundColorWhenOver : 'transparent';

    const borderStyle = isEmpty ? 'dashed' : 'solid';

    const slotStyle: React.CSSProperties = {
        width: '100px',
        height: '150px',
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        boxShadow: isOver && !isEmpty
            ? '0 0 0 3px rgba(255,152,0,0.4)' // stronger glow when inserting/replacing
            : '2px 2px 6px rgba(0,0,0,0.2)',
        margin: '5px',
        transition: 'background-color 0.15s, border-color 0.15s, box-shadow 0.15s, border-width 0.15s',
    };

    return (
        <div ref={setNodeRef} style={slotStyle}>
            {card ? <DraggableCard card={card} index={index}/> : null}
        </div>
    );
};
