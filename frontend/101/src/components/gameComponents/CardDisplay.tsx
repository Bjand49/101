import React from 'react';
import type { Card } from '../../models/Card'; // Adjust path

interface CardProps extends Card {
    isHidden?: boolean;
}

export const CardDisplay: React.FC<CardProps> = ({ suit, number, isHidden = false }) => {
    const cardStyle: React.CSSProperties = {
        width: '100px', 
        height: '150px',
        border: '1px solid black',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isHidden ? 'gray' : 'white',
        color: isHidden ? 'transparent' : 'black',
        fontSize: '24px',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
        margin: '5px'
    };
    return (
        <div style={cardStyle}>
            {!isHidden && (
                <>
                    <div>{number}</div>
                    <div>{suit}</div>
                </>
            )}
        </div>
    );
};