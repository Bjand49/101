using OneZeroOne.Core;
using OneZeroOne.Web.Hubs;

namespace OneZeroOne.Web.Controllers
{
    public static class GameManagerController
    {
        public static void RegisterManagerRoutes(this WebApplication app)
        {
            //Create game
            app.MapPost("/games", async (GameManager gameManager, GameNotifier notifier) =>
            {
                var gameId = gameManager.CreateGame();
                await notifier.SendGameCreatedMessage(gameId);
                return Results.Ok(gameId);
            });

            app.MapGet("/games/{gameId}", (Guid gameId, GameManager gameManager) =>
            {
                var game = gameManager.GetGame(gameId);
                if (game == null)
                {
                    return Results.NotFound();
                }
                return Results.Ok(game);
            });

            app.MapPost("/games/{gameId}/start", async (Guid gameId, GameManager gameManager, GameNotifier notifier) =>
            {
                var game = gameManager.StartGame(gameId);
                if (game == null)
                {
                    return Results.NotFound();
                }
                await notifier.SendGameStartedMessage(gameId);

                return Results.Ok(game);
            });

            app.MapGet("/games", (GameManager gameManager) =>
            {
                var games = gameManager.GetGames();
                return Results.Ok(games);
            });

            app.MapPost("/games/{gameId}/player", async (Guid gameId, string name, GameManager gameManager, GameNotifier notifier) =>
            {
                var result = gameManager.JoinGame(gameId, name);

                if (!result.IsSuccess)
                {
                    // Notify all clients in this game's group that a new player has joined
                    return Results.BadRequest(result.Error);
                }
                await notifier.SendJoinUpdates(gameId);
                return Results.Ok(result);

            });


        }
    }
}
