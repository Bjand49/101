
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
    id: string | number;
    children: React.ReactNode;
}

export default function Droppable({ id, children }: Readonly<DroppableProps>) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });
    const style = {
        opacity: isOver ? 1 : 0.5,
    };
    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
}
