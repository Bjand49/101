import React from 'react';

interface GamePageProps {}

const GamePage: React.FC<GamePageProps> = () => {
    return (
        <div className="game-page">
            <h1>Game Page</h1>
            <p>Welcome to the game page.</p>
        </div>
    );
};

export default GamePage;