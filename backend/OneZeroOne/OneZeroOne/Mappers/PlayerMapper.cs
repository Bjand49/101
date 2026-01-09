using OneZeroOne.Core.Models;
using OneZeroOne.Web.Models;

namespace OneZeroOne.Web.Mappers
{
    public static class PlayerMapper
    {
        public static PlayerViewModel ToViewModel(this Player player)
        {
            var playerViewModel = new PlayerViewModel
            {
                Id = player.Id,
                Name = player.Name,
                DiscardCard1 = player.DiscardPile.Count > 0 ? player.DiscardPile[player.DiscardPile.Count - 1] : null,
                DiscardCard2 = player.DiscardPile.Count > 1 ? player.DiscardPile[player.DiscardPile.Count - 2] : null
            };
            return playerViewModel;
        }
    }
}
