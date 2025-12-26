using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Core;

namespace OneZeroOne.Web.Hubs
{
    public class GameNotifier(IHubContext<GameHub> _hub, GameManager manager)
    {
        private static readonly string GET_ALL_GAME_UPDATES_GROUP = "GetAllGameUpdatesGroup";
        private static readonly string GET_SPECIFIC_GAME_UPDATES_GROUP = "GetGameUpdatesGroup";
        public static readonly string[] ALL_GROUPS = new string[]
        {
            GET_ALL_GAME_UPDATES_GROUP,
            GET_SPECIFIC_GAME_UPDATES_GROUP
        };

        public async Task SendGameStartedMessage(Guid id)
        {
            await _hub.Clients.All.SendAsync("GameStart", GET_SPECIFIC_GAME_UPDATES_GROUP + id);
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

    }
}
