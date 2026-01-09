using OneZeroOne.Core;
using OneZeroOne.Core.Models;
using OneZeroOne.Web.SignalR;

namespace OneZeroOne.Web.Controllers
{
    public static class GameController
    {
        public static void RegisterGameRoutes(this WebApplication app)
        {
            app.MapGet("/games/{gameId}/{playerId}/hand", GetPlayerHand);
            app.MapPost("/games/{gameId}/{playerId}/hand/play", PlayCard);
            app.MapPost("/games/{gameId}/{playerId}/hand/draw", DrawCard);
            app.MapPost("/games/{gameId}/{playerId}/hand/drawdiscard", DrawFromDiscard);
            app.MapPost("/games/{gameId}/{playerId}/hand/declare", DeclareHand);
        }

        private static IResult GetPlayerHand(Guid gameId, Guid playerId, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }

            var hand = gameManager.GetGameHand(gameId, playerId);
            if (!hand.IsSuccess)
            {
                return Results.BadRequest(hand.Error);
            }
            return Results.Ok(hand.Value);
        }

        private static async Task<IResult> PlayCard(Guid gameId, GameNotifier notifier, Guid playerId, Card card, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }
            if (card == null)
            {
                return Results.BadRequest("Card cannot be null");
            }

            var returncard = gameManager.PlayCard(gameId, playerId, card);
            if (!returncard.IsSuccess || returncard.Value == null)
            {
                return Results.BadRequest(returncard.Error);
            }
            var currentTurn = gameManager.GetGame(gameId)!.ActivePlayerId;
            await notifier.PlayedCardUpdate(gameId, playerId, returncard.Value, currentTurn);
            return Results.Ok(returncard.Value);
        }

        private static IResult DrawCard(Guid gameId, Guid playerId, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }

            var result = gameManager.DrawCard(gameId, playerId);
            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Error);
            }
            return Results.Ok(result.Value);
        }

        private static IResult DrawFromDiscard(Guid gameId, Guid playerId, Guid discardPilePlayer, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }
            if (discardPilePlayer == Guid.Empty)
            {
                return Results.BadRequest("Discard pile player ID cannot be empty");
            }

            var result = gameManager.DrawCard(gameId, playerId, discardPilePlayer);
            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Error);
            }
            return Results.Ok(result.Value);
        }

        private static IResult DeclareHand(Guid gameId, Guid playerId, List<List<Card>> cards, GameManager gameManager)
        {
            if (gameId == Guid.Empty)
            {
                return Results.BadRequest("Game ID cannot be empty");
            }
            if (playerId == Guid.Empty)
            {
                return Results.BadRequest("Player ID cannot be empty");
            }
            if (cards == null || cards.Count == 0)
            {
                return Results.BadRequest("Cards cannot be null or empty");
            }
            if (cards.Any(group => group == null || group.Count == 0))
            {
                return Results.BadRequest("Card groups cannot be null or empty");
            }

            var result = gameManager.DeclareHand(gameId, playerId, cards);
            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Error);
            }
            return Results.Ok(result.Value);
        }
    }
}
