using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Web.Hubs;

namespace OneZeroOne.Web.Controllers
{
    public static class SignalRController
    {
        public static void RegisterSignalRRoutes(this WebApplication app)
        {
            app.MapHub<GameHub>("/gamehub");
            app.MapGet("/groups", () =>
            {
                return Results.Ok(GameHub.ALL_GROUPS);
            });
            app.MapPost("/groups/join", (string name, GameHub hub) =>
            {
                return Results.Ok(hub.JoinGroup(name));
            });
            app.MapPost("/groups/leave", (string name, GameHub hub) =>
            {
                return Results.Ok(hub.LeaveGroup(name));
            });

        }
    }
}