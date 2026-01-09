using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;
using OneZeroOne.Web.SignalR;
using OneZeroOne.Web.Mappers;

namespace OneZeroOne.Web.Controllers
{
    public static class GameManagerController
    {
        public static void RegisterManagerRoutes(this WebApplication app)
        {
            //Create game
            app.MapPost("/games", CreateGame);

            app.MapGet("/games/{gameId}", GetGameById);

            app.MapPost("/games/{gameId}/start", StartGame);

            app.MapGet("/games", GetAllGames);

            app.MapPost("/games/{gameId}/join", JoinGame);

            app.MapPost("/games/{gameId}/leave", LeaveGame);

            app.MapPost("/games/clear", ClearGames);
        }

        private static async Task<IResult> CreateGame(GameManager gameManager, GameNotifier notifier)
        {
            var gameId = gameManager.CreateGame();
            await notifier.SendGameCreatedMessage(gameId);
            return Results.Ok(gameId);
        }

        private static IResult GetGameById(Guid gameId, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }

            var game = gameManager.GetGame(gameId);
            if (game == null)
            {
                return Results.NotFound("Game not found");
            }
            return Results.Ok(game.ToViewModel());
        }

        private static async Task<IResult> StartGame(Guid gameId, GameManager gameManager, GameNotifier notifier)
        {
            var game = gameManager.StartGame(gameId);
            if (game == null)
            {
                return Results.NotFound();
            }
            await notifier.SendGameStartedMessage(gameId);

            return Results.Ok(game);
        }

        private static IResult GetAllGames(GameManager gameManager)
        {
            var games = gameManager.GetGames();
            return Results.Ok(games.Select(x => x.ToViewModel()));
        }

        private static async Task<IResult> JoinGame(GameManager gameManager, GameNotifier notifier, GameHub hub, Guid gameId, Player player)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (player == null)
            {
                return Results.BadRequest("Player cannot be null");
            }
            if (player.Id == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }

            var result = gameManager.JoinGame(gameId, player);

            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Error);
            }

            await hub.JoinGameGroup(gameId);
            await notifier.GamePlayerUpdate(gameId);

            return Results.Ok(result.Value!.ToViewModel());
        }

        private static async Task<IResult> LeaveGame(GameManager gameManager, GameNotifier notifier, GameHub hub, Guid gameId, [FromBody]Guid playerId)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }

            var result = gameManager.LeaveGame(gameId, playerId);

            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Error);
            }

            await hub.LeaveGameGroup(gameId);
            await notifier.GamePlayerUpdate(gameId);

            return Results.Ok(result.Value!.ToViewModel());
        }

        private static async Task<IResult> ClearGames(GameManager gameManager)
        {
            gameManager.Reset();
            return Results.Ok();
        }
    }
}
