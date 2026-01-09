namespace OneZeroOne.Web.Models
{
    public class GameViewModel
    {
        public Guid Id { get; set; }
        public List<PlayerViewModel> Players { get; set; } = new();
        public Guid ActivePlayerId { get; set; }
        public int ActivePlayers => Players.Count;

    }
}
