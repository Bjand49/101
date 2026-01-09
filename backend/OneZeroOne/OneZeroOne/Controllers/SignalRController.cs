using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using OneZeroOne.Web.SignalR;

namespace OneZeroOne.Web.Controllers
{
    public static class SignalRController
    {
        public static void RegisterSignalRRoutes(this WebApplication app)
        {
            app.MapHub<GameHub>("/gamehub");
        }
    }
}