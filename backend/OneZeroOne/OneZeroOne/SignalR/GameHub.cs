using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;

namespace OneZeroOne.Web.SignalR
{
    public class GameHub : Hub
    {        
        public static string GetGameGroupName(Guid gameId) => $"Game-{gameId}";
        internal async Task JoinGameGroup(Guid gameId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGameGroupName(gameId));
        }


        internal async Task LeaveGameGroup(Guid gameId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGameGroupName(gameId));
        }
    }
}
