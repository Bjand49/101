using OneZeroOne.Core.Models;

namespace OneZeroOne.Web.Models
{
    public class PlayerViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Card? DiscardCard1 { get; set; }
        public Card? DiscardCard2 { get; set; }
    }
}
