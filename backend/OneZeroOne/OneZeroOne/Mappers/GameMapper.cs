using OneZeroOne.Core.Models;
using OneZeroOne.Web.Models;

namespace OneZeroOne.Web.Mappers
{
    public static class GameMapper
    {
        public static GameViewModel ToViewModel(this Game game)
        {
            var gameViewModel = new GameViewModel
            {
                Id = game.Id,
                ActivePlayerId = game.ActivePlayerId,
                Players = game.Players.ConvertAll(player => player.ToViewModel())
            };
            return gameViewModel;
        }
    }
}
