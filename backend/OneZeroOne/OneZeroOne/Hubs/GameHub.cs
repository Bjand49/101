using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;

namespace OneZeroOne.Web.Hubs
{
    public class GameHub(GameNotifier notifier, GameManager manager) : Hub
    {
        private static readonly string GET_ALL_GAME_UPDATES_GROUP = "GetAllGameUpdatesGroup";
        private static readonly string GET_SPECIFIC_GAME_UPDATES_GROUP = "GetGameUpdatesGroup";
        public static readonly string[] ALL_GROUPS = new string[]
        {
            GET_ALL_GAME_UPDATES_GROUP,
            GET_SPECIFIC_GAME_UPDATES_GROUP
        };


        public async Task<bool> JoinGroup(string name)
        {
            if (name != GET_ALL_GAME_UPDATES_GROUP && !manager.GetGameIds().Select(x=> GET_SPECIFIC_GAME_UPDATES_GROUP + x).Contains(name))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, name);
                return true;
            }
            return false;
        }
        public async Task<bool> LeaveGroup(string name)
        {
            if (name == "GetAllGameUpdatesGroup" || manager.GetGameIds().Select(x => GET_SPECIFIC_GAME_UPDATES_GROUP + x).Contains(name))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, name);
                return true;
            }
            return false;
        }

    }
}
