using OneZeroOne.Core;
using OneZeroOne.Core.Enums;
using OneZeroOne.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OneZeroOne.Tests
{
    public class GameTest
    {

        [Fact]
        public void DrawCardFromDeck_WithCardsInDeck_ReturnsCard()
        {
            // Arrange
            var game = new Game();
            var playerResult = game.AddPlayer(Generators.GeneratePlayer(1));
            var player = playerResult.Value!;
            game.ActivePlayerId = player.Id;

            // Act
            var result = game.DrawCard(player.Id);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Null(result.Error);
        }


        [Fact]
        public void DrawCardFromPlayerDiscardPile_WithValidPreviousPlayer_ReturnsCard()
        {
            // Arrange
            var game = new Game();
            var player1Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player2Result = game.AddPlayer(Generators.GeneratePlayer(2));
            var player1 = player1Result.Value!;
            var player2 = player2Result.Value!;

            var testCard = new Card(5, Suit.Hearts);
            player1.DiscardPile.Add(testCard);

            game.ActivePlayerId = player2.Id;

            // Act
            var result = game.DrawCard(player2.Id, player1.Id);

            // Assert
            var card = result.Value;
            Assert.True(result.IsSuccess);
            Assert.NotNull(card);
            Assert.Equal(testCard, card);
            Assert.Null(result.Error);

        }

        [Fact]
        public void DrawCardFromPlayerDiscardPile_WithNonExistentPlayer_ReturnsFailure()
        {
            // Arrange
            var game = new Game();
            var playerResult = game.AddPlayer(Generators.GeneratePlayer(1));
            var player = playerResult.Value!;
            game.ActivePlayerId = player.Id;
            var nonExistentPlayerId = Guid.NewGuid();

            // Act
            var result = game.DrawCard(player.Id, nonExistentPlayerId);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
            Assert.Equal("Target player not found", result.Error);
        }

        [Fact]
        public void DrawCardFromPlayerDiscardPile_WithEmptyDiscardPile_ReturnsFailure()
        {
            // Arrange
            var game = new Game();
            var player1Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player2Result = game.AddPlayer(Generators.GeneratePlayer(2));
            var player1 = player1Result.Value!;
            var player2 = player2Result.Value!;

            // Set Player 2 as active
            game.ActivePlayerId = player2.Id;

            // Act - Try to draw from Player 1's empty discard pile
            var result = game.DrawCard(player2.Id, player1.Id);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
            Assert.Equal("No cards in the discard pile", result.Error);
        }

        [Fact]
        public void DrawCardFromPlayerDiscardPile_WithInvalidPlayerPosition_ReturnsFailure()
        {
            // Arrange
            var game = new Game();
            var player1Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player2Result = game.AddPlayer(Generators.GeneratePlayer(2));
            var player3Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player1 = player1Result.Value!;
            var player2 = player2Result.Value!;
            var player3 = player3Result.Value!;

            // Player 3 discards a card
            var testCard = new Card(7, Suit.Clubs);
            player3.DiscardPile.Add(testCard);

            // Set Player 2 as active
            game.ActivePlayerId = player2.Id;

            // Act - Player 2 tries to draw from Player 3 (not the previous player)
            var result = game.DrawCard(player2.Id, player3.Id);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
        }

        [Fact]
        public void DrawCardFromPlayerDiscardPile_FirstPlayerCanDrawFromLastPlayer_ReturnsCard()
        {
            // Arrange
            var game = new Game();
            var player1Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player2Result = game.AddPlayer(Generators.GeneratePlayer(2));
            var player3Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player1 = player1Result.Value!;
            var player2 = player2Result.Value!;
            var player3 = player3Result.Value!;

            // Player 3 (last player) discards a card
            var testCard = new Card(10, Suit.Diamonds);
            player3.DiscardPile.Add(testCard);

            // Set Player 1 as active (first player should be able to draw from last player)
            game.ActivePlayerId = player1.Id;

            // Act
            var result = game.DrawCard(player1.Id, player3.Id);

            // Assert 
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal(testCard, result.Value);
        }

        [Fact]
        public void DrawCardFromPlayerDiscardPile_ReturnsTopCard()
        {
            // Arrange
            var game = new Game();
            var player1Result = game.AddPlayer(Generators.GeneratePlayer(1));
            var player2Result = game.AddPlayer(Generators.GeneratePlayer(2));
            var player1 = player1Result.Value!;
            var player2 = player2Result.Value!;

            // Player 1 discards multiple cards
            var card1 = new Card(3, Suit.Hearts);
            var card2 = new Card(7, Suit.Spades);
            var topCard = new Card(10, Suit.Diamonds);
            player1.DiscardPile.Add(card1);
            player1.DiscardPile.Add(card2);
            player1.DiscardPile.Add(topCard);

            // Set Player 2 as active
            game.ActivePlayerId = player2.Id;

            // Act
            var result = game.DrawCard(player2.Id, player1.Id);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal(topCard, result.Value);
        }

        [Fact]
        public void DrawCard_NotPlayersTurn_ReturnsFailure()
        {
            // Arrange
            var game = new Game();
            var playerResult = game.AddPlayer(Generators.GeneratePlayer(2));
            var player = playerResult.Value!;
            game.ActivePlayerId = Guid.NewGuid(); 

            // Act
            var result = game.DrawCard(player.Id);
            // Assert

            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
        }

        [Fact]
        public void JoinGame_PlayerAlreadyInGame_ReturnsFailure()
        {
            // Arrange
            var gameManager = new GameManager();
            var gameId = gameManager.CreateGame();
            var player = Generators.GeneratePlayer(1);
            var firstJoinResult = gameManager.JoinGame(gameId,player);

            // Act
            var secondJoinResult = gameManager.JoinGame(gameId, player);

            // Assert
            Assert.True(firstJoinResult.IsSuccess);
            Assert.False(secondJoinResult.IsSuccess);
        }

        [Fact]
        public void StartGame_WithAlreadyStartedGame_ReturnsFailure()
        {
            // Arrange
            var gameManager = new GameManager();
            var gameId = gameManager.CreateGame();
            var player1 = Generators.GeneratePlayer(1);
            var player2 = Generators.GeneratePlayer(2);
            gameManager.JoinGame(gameId, player1);
            gameManager.JoinGame(gameId, player2);
            var startResult = gameManager.StartGame(gameId);

            // Act
            var secondStartResult = gameManager.StartGame(gameId);

            // Assert
            Assert.True(startResult.IsSuccess);
            Assert.False(secondStartResult.IsSuccess);
        }

    }
}