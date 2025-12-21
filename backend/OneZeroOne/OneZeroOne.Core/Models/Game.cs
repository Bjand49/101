using OneZeroOne.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Core.Models
{
    public class Game
    {
        public Game()
        {
            // Create a 104-card deck
            for (byte number = 1; number <= 13; number++)
            {
                Cards.Add(new Card(number, Suit.Hearts));
                Cards.Add(new Card(number, Suit.Diamonds));
                Cards.Add(new Card(number, Suit.Clubs));
                Cards.Add(new Card(number, Suit.Spades));
                
                Cards.Add(new Card(number, Suit.Hearts));
                Cards.Add(new Card(number, Suit.Diamonds));
                Cards.Add(new Card(number, Suit.Clubs));
                Cards.Add(new Card(number, Suit.Spades));
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
        public List<Player> Players { get; set; } = new List<Player>();
        public Guid ActivePlayerId { get; set; }
        public List<Card> Cards { get; private set; } = new List<Card>();

        public Result<Card> DrawCard(Guid playerId, Guid? discardPilePlayer = null)
        {
            var player = Players.Find(p => p.Id == playerId);
            if (ActivePlayerId != playerId)
            {
                return Result<Card>.Failure("It's not your turn");
            }
            else if (player == null)
            {
                return Result<Card>.Failure("Player not found");
            }

            Result<Card> cardresult;
            if (discardPilePlayer.HasValue)
            {
                cardresult = DrawCardFromPlayerDiscardPile(playerId, discardPilePlayer.Value);
            }
            else
            {
                cardresult = DrawCardFromDeck();
            }

            if (cardresult.IsSuccess)
            {
                player.AddCardToHand(cardresult.Value!);
            }
            return cardresult;

        }
        public Result<Card> PlayCard(Guid playerId, Card card)
        {
            var player = Players.Find(p => p.Id == playerId);

            if (ActivePlayerId != playerId)
            {
                return Result<Card>.Failure("It's not your turn");
            }
            else if (player == null)
            {
                return Result<Card>.Failure("Player not found");
            }
            var success = player.PlayCard(card);
            if (!success)
            {
                return Result<Card>.Failure("Player does not have that card");
            }
            return Result<Card>.Success(card);
        }

        public Result<Player> AddPlayer(string? name)
        {
            if (Players.Count >= 4)
            {
                return Result<Player>.Failure("Game is full");
            }
            var player = new Player(name);
            Players.Add(player);
            return Result<Player>.Success(player);
        }
        public Result<List<Card>> GetPlayerHand(Guid playerId)
        {
            var player = Players.Find(p => p.Id == playerId);
            if (player == null)
            {
                return Result<List<Card>>.Failure("Player not found");
            }
            return Result<List<Card>>.Success(player.Hand);
        }
        public Result<Guid> StartGame()
        {
            if (Players.Count < 2)
            {
                return Result<Guid>.Failure("Not enough players to start the game");
            }
            ActivePlayerId = Players[0].Id;
            foreach (var player in Players)
            {
                for (int i = 0; i < 14; i++)
                {
                    var cardResult = DrawCardFromDeck();
                    if (cardResult.IsSuccess)
                    {
                        player.AddCardToHand(cardResult.Value!);
                    }
                    else
                    {
                        return Result<Guid>.Failure("Not enough cards in the deck to deal to players");
                    }
                }
            }
            return Result<Guid>.Success(ActivePlayerId);
        }

        private Result<Card> DrawCardFromDeck()
        {

            if (Cards.Count == 0)
            {
                return Result<Card>.Failure("The deck is empty.");
            }

            var card = Cards[0];
            Cards.RemoveAt(0);
            return Result<Card>.Success(card);
        }

        private Result<Card> DrawCardFromPlayerDiscardPile(Guid player, Guid discardPilePlayer)
        {
            var playerIndex = Players.Select((p, index) => new { p, Index = index });
            var currentPlayer = playerIndex.FirstOrDefault(p => p.p.Id == player)!;
            var targetPlayer = playerIndex.FirstOrDefault(p => p.p.Id == discardPilePlayer);
            if (targetPlayer == null)
            {
                return Result<Card>.Failure("Target player not found");
            }
            else if (targetPlayer.Index - currentPlayer.Index != -1 && !(targetPlayer.Index == Players.Count - 1 && currentPlayer.Index == 0))
            {
                return Result<Card>.Failure($"Cant draw from {targetPlayer.p.Name}");
            }
            else if (targetPlayer.p.DiscardPile.Count == 0)
            {
                return Result<Card>.Failure("No cards in the discard pile");
            }
            else
            {
                var card = Players.First(x => x.Id == discardPilePlayer).GetTopDiscardedCard();
                if (card == null)
                {
                    return Result<Card>.Failure("No cards in the discard pile");
                }
                return Result<Card>.Success(card);
            }


        }

    }
}
