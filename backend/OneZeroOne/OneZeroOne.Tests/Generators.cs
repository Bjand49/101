using OneZeroOne.Core.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Tests
{
    internal static class Generators
    {
        internal static Player GeneratePlayer(int number)
        {
            return new Player("Test Player" + number)
            {
                Id = Guid.NewGuid(),
                Hand = new List<Card>(),
                DiscardPile = new List<Card>()
            };
        }
    }
}
