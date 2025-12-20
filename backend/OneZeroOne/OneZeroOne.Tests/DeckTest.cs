using OneZeroOne.Core.Models;

namespace OneZeroOne.Tests
{
    public class DeckTest
    {
        [Fact]
        public void DrawingFromDeck52Times_WithNewDeck_ReturnsSuccess()
        {
            // Arrange 
            var deck = new Deck();
            var cardsDrawn = new List<Card?>();

            // Act
            for (int i = 0; i < 52; i++)
            {
                cardsDrawn.Add(deck.DrawCard().Value);
            }

            // Assert
            Assert.All(cardsDrawn, card => Assert.NotNull(card));
            Assert.Equal(52, cardsDrawn.Distinct().Count());
            Assert.Empty(deck.Cards);
        }

        [Fact]
        public void DrawingFromDeck53Times_WithNewDeck_ReturnsFailure()
        {
            // Arrange 
            var deck = new Deck();
            var cardsDrawn = new List<Card?>();

            // Act
            for (int i = 0; i < 52; i++)
            {
                cardsDrawn.Add(deck.DrawCard().Value);
            }
            var test = deck.DrawCard();
            
            // Assert
            Assert.False(test.IsSuccess);
        }

    }
}
