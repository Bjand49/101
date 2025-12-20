using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace OneZeroOne.Core.Models
{
    public class GameManager
    {
        private readonly Dictionary<Guid,Game> _games = new Dictionary<Guid,Game>();
        public Game CreateGame()
        {
            var game = new Game();
            _games.Add(game.Id, game);
            return game;
        }
        
        public Game? GetGame(Guid id)
        {
            if (_games.ContainsKey(id))
            {
                return _games[id];
            }
            return null;
        }

        public IEnumerable<Game> GetGames() {
            return _games.Values;
        }
        public Result<Card> DrawCard (Guid gameId, Guid playerId)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Card>.Failure("Game not found");
            }
            return game.DrawCard(playerId);
        }

        public Result<Card> PlayCard(Guid gameId, Guid playerId, Card card)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Card>.Failure("Game not found");
            }
            return game.PlayCard(playerId, card);
        }
        public Result<Player> AddPlayer(Guid gameId, string? name)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Player>.Failure("Game not found");
            }
            return game.AddPlayer(name);
        }

    }
}
