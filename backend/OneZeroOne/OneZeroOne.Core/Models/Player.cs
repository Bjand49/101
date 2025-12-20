using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Core.Models
{
   
    public class Player
    {
        private static readonly List<string> _defaultNames =
        [
            "Alice",
            "Bob",
            "Charlie",
            "Diana",
            "Eve",
            "Frank",
            "Grace",
            "Hank",
            "Büc"
        ];

        public Player(string? name)
        {
            Name = name ?? _defaultNames[new Random().Next(0, _defaultNames.Count)];
        }
        public List<Card> Hand { get; set; } = new List<Card>();
        public List<Card> DiscardPile { get; set; } = new List<Card>();
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }

        public Card? GetTopDiscardedCard()
        {
            if (DiscardPile.Count == 0)
            {
                return null;
            }
            return DiscardPile[DiscardPile.Count - 1];
        }

        public void AddCardToHand(Card card)
        {
            Hand.Add(card);
        }

        public bool PlayCard(Card card)
        {
            if (Hand.Contains(card))
            {
                Hand.Remove(card);
                DiscardPile.Add(card);
                return true;
            }
            return false;
        }
    }
}
