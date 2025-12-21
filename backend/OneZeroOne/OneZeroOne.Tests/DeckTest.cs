using OneZeroOne.Core.Models;

namespace OneZeroOne.Tests
{
    public class DeckTest
    {
        [Fact]
        public void DrawingFromDeck104Times_WithNewDeck_ReturnsSuccess()
        {
            // Arrange 
            var game = new Game();
            var player1 = game.AddPlayer("player1").Value;
            game.AddPlayer("player2");
            game.StartGame();
            var cardsDrawn = new List<Card?>();

            // Act
            for (int i = 0; i < 76; i++)
            {
                cardsDrawn.Add(game.DrawCard(player1.Id).Value);
            }

            // Assert
            Assert.All(cardsDrawn, card => Assert.NotNull(card));
            Assert.Equal(76, cardsDrawn.Count);
            Assert.Empty(game.Cards);
        }

        [Fact]
        public void DrawingFromDeck105Times_WithNewDeck_ReturnsFailure()
        {
            // Arrange 
            var game = new Game();
            var player1 = game.AddPlayer("player1").Value;
            game.AddPlayer("player2");
            game.StartGame();
            var cardsDrawn = new List<Card?>();

            // Act
            for (int i = 0; i < 77; i++)
            {
                cardsDrawn.Add(game.DrawCard(player1.Id).Value);
            }
            var test = game.DrawCard(player1.Id);
            
            // Assert
            Assert.False(test.IsSuccess);
            Assert.Equal(76, cardsDrawn.Count(x => x != null));
            Assert.Empty(game.Cards);

        }

    }
}
