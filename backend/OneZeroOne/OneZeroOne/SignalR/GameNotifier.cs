using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;

namespace OneZeroOne.Web.SignalR
{
    public class GameNotifier(IHubContext<GameHub> _hub, GameManager manager)
    {
        public async Task SendGameStartedMessage(Guid id)
        {
            await _hub.Clients.All.SendAsync("GameStart", id);
        }

        public async Task SendGameCreatedMessage(Guid id)
        {
            await _hub.Clients.All.SendAsync("GameCreated", id);
        }

        public async Task GamePlayerUpdate(Guid gameId)
        {
            var game = manager.GetGame(gameId);
            if (game == null)
            {
                return;
            }
            await _hub.Clients.All.SendAsync("GamePlayerUpdate", game.Players, gameId);
        }
        public async Task PlayedCardUpdate(Guid gameId, Guid playerId, Card card, Guid activePlayer)
        {
            await _hub.Clients
                .All
                .SendAsync("PlayedCard",gameId, playerId, card, activePlayer);
        }
}
}
