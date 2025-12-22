using OneZeroOne.Core;
using OneZeroOne.Core.Models;
using OneZeroOne.Web.Hubs;

namespace OneZeroOne.Web.Controllers
{
    public static class GameController
    {
        public static void RegisterGameRoutes(this WebApplication app)
        {
            // Player Interaction Endpoints
            app.MapGet("/games/{gameId}/{playerId}/hand", (Guid gameId, Guid playerId, GameManager gameManager) =>
            {
                return Results.Ok(gameManager.GetGameHand(gameId, playerId));
            });
            app.MapPost("/games/{gameId}/{playerId}/hand/play", (Guid gameId, Guid playerId, Card card, GameManager gameManager) =>
            {
                return Results.Ok(gameManager.PlayCard(gameId, playerId, card));
            });
            app.MapPost("/games/{gameId}/{playerId}/hand/draw", (Guid gameId, Guid playerId, GameManager gameManager, Guid? discardPilePlayer = null) =>
            {
                return Results.Ok(gameManager.DrawCard(gameId, playerId));
            });
        }
    }
}
