using OneZeroOne.Core.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Tests
{
    public class PlayerTest
    {
        [Fact]
        public void CreatingNewPlayer_WithNoName_CreatesDefaultName()
        {
            // Arrange & Act
            var player = new Player(null);
            // Assert

            Assert.NotNull(player);
            Assert.NotNull(player.Name);
            Assert.NotEqual(Guid.Empty, player.Id);
            Assert.Empty(player.Hand);
        }

        [Fact]
        public void CreatingNewPlayer_WithName_CreatesNamedPlayer()
        {
            // Arrange & Act
            var name = "Test Player";
            var player = new Player(name);
            // Assert

            Assert.NotNull(player);
            Assert.Equal(name, player.Name);
            Assert.NotEqual(Guid.Empty, player.Id);
            Assert.Empty(player.Hand);
        }
    }
}
