import { useDroppable } from '@dnd-kit/core';

interface DroppableDividerProps {
    id: string | number;
    dividerIndex?: number;
}

export default function DroppableDivider({ id }: Readonly<DroppableDividerProps>) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });
    
    
    const borderColor = '#4caf50';
    const backgroundColor = '#e8f5e9';
    
    
    const style = {
        backgroundColor: isOver ? backgroundColor : 'transparent',
        border: isOver ? `2px dashed ${borderColor}` : '2px dashed transparent ',
        borderRaduis: '8px',
    };
    return (
        <div ref={setNodeRef} style={style}>
            {id}
        </div>
    );
}
