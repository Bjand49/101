import React from 'react';
import type { Card } from '../../models/Card'; // Adjust path


export const CardDisplay: React.FC<Card> = ({ suit, number }) => {
    const cardStyle: React.CSSProperties = {
        width: '100px',
        height: '150px',
        border: '1px solid black',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        color: 'black',
        fontSize: '24px',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
        margin: '5px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    };
    return (
        <div style={cardStyle}>
            <div>{number}</div>
            <div>{suit}</div>
        </div>
    );
};