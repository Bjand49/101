using OneZeroOne.Core.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace OneZeroOne.Core
{
    public class GameManager
    {
        private readonly Dictionary<Guid,Game> _games = new Dictionary<Guid,Game>();
        public Guid CreateGame()
        {
            var game = new Game();
            _games.Add(game.Id, game);
            return game.Id;
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
        public IEnumerable<Guid> GetGameIds()
        {
            return _games.Values.Select(x=> x.Id);
        }
        public Result<Card> DrawCard (Guid gameId, Guid playerId, Guid? discardPilePlayer = null)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Card>.Failure("Game not found");
            }
            return game.DrawCard(playerId, discardPilePlayer);
        }
        public Result<List<Card>> GetGameHand(Guid gameId, Guid playerId)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<List<Card>>.Failure("Game not found");
            }
            return game.GetPlayerHand(playerId);
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

        public Result<Player> JoinGame(Guid gameId, string? name)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Player>.Failure("Game not found");
            }
            return game.AddPlayer(name);
        }

        public Result<Guid> StartGame (Guid gameId)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Guid>.Failure("Game not found");
            }
            return game.StartGame();
        }

    }
}
