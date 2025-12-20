using OneZeroOne.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Core.Models
{
    public class Deck
    {
        public Deck()
        {
            // Create a standard 52-card deck
            for (byte number = 1; number <= 13; number++)
            {
                Cards.Add(new Card(number, Colors.Hearts));
                Cards.Add(new Card(number, Colors.Diamonds));
                Cards.Add(new Card(number, Colors.Clubs));
                Cards.Add(new Card(number, Colors.Spades));
            }

            // Shuffle the deck using Fisher-Yates algorithm
            var random = Random.Shared;
            for (int i = Cards.Count - 1; i > 0; i--)
            {
                var j = random.Next(i + 1);
                (Cards[i], Cards[j]) = (Cards[j], Cards[i]);
            }
        }
        public Guid Id { get; set; } = Guid.NewGuid();
        public List<Card> Cards { get; private set; } = new List<Card>();

        /// <summary>
        /// Removes and returns the top card from the deck.
        /// </summary>
        /// <returns>A <see cref="Result{Card}"/> containing the drawn card if the deck is not empty; otherwise, a failure result
        /// with an error message.</returns>
        public Result<Card> DrawCard()
        {
            if (Cards.Count == 0)
            {
                return Result<Card>.Failure("The deck is empty.");
            }

            var card = Cards[0];
            Cards.RemoveAt(0);
            return Result<Card>.Success(card);
        }


    }
}
