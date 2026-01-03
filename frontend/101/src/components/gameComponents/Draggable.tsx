
import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

interface DraggableProps {
    id: string | number;
    children: React.ReactNode;
}

export default function Draggable({ id, children }: Readonly<DraggableProps>) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: id,
    });
    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
    };

    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </button>
    );
}
