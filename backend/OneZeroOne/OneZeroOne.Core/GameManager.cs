using OneZeroOne.Core.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Logging;

namespace OneZeroOne.Core
{
    public class GameManager
    {
        private readonly Dictionary<Guid, Game> _games = new Dictionary<Guid, Game>();
        private readonly ILogger<GameManager> _logger;
        public GameManager(ILogger<GameManager> logger)
        {
            _logger = logger;
        }
        public Guid CreateGame()
        {
            var game = new Game();
            _games.Add(game.Id, game);
            _logger.LogInformation("Created new game with ID: {GameId}", game.Id);
            return game.Id;
        }

        public Game? GetGame(Guid id)
        {
            if (_games.ContainsKey(id))
            {
                _logger.LogDebug("Retrieved game with ID: {GameId}", id);
                return _games[id];
            }
            _logger.LogWarning("Game with ID: {GameId} not found", id);
            return null;
        }

        public IEnumerable<Game> GetGames()
        {
            var games = _games.Values.Where(x=> x.ActivePlayerId == Guid.Empty);
            return games;
        }
        public IEnumerable<Guid> GetGameIds()
        {
            var games = _games.Values.Select(x => x.Id);
            _logger.LogDebug("Found {GamesAmount} of games", games.Count());
            return games;
        }
        public Result<Card> DrawCard(Guid gameId, Guid playerId, Guid? discardPilePlayer = null)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                _logger.LogWarning("DrawCard failed: Game with ID: {GameId} not found", gameId);
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

        public Result<List<List<Card>>> DeclareHand(Guid gameId, Guid playerId, List<List<Card>> cards)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<List<List<Card>>>.Failure("Game not found");
            }
            return game.DeclareHand(playerId, cards);
        }


        public Result<Player> JoinGame(Guid gameId, Player player)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Player>.Failure("Game not found");
            }
            else if (game.Players.Any(x => x.Id == player.Id))
            {
                return Result<Player>.Failure("Player already in game");
            }
            return game.AddPlayer(player);
        }

        public Result<Player> LeaveGame(Guid gameId, Guid playerId)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Player>.Failure("Game not found");
            }
            return game.RemovePlayer(playerId);
        }

        public Result<Guid> StartGame(Guid gameId)
        {
            var game = GetGame(gameId);
            if (game == null)
            {
                return Result<Guid>.Failure("Game not found");
            }
            else if (game.ActivePlayerId != Guid.Empty)
            {
                return Result<Guid>.Failure("Game already started");
            }
            return game.StartGame();
        }

        public void Reset()
        {
            _games.Clear();
        }

    }
}
