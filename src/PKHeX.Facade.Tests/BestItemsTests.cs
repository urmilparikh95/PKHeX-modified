using AwesomeAssertions;
using PKHeX.Facade.Tests.Base;

namespace PKHeX.Facade.Tests;

public class BestItemsTests
{
    private static int CountOf(Game game, string name) => game.Trainer.Inventories.InventoryItems.Values
        .SelectMany(inventory => inventory.AllExceptNone())
        .Where(item => item.Name == name)
        .Sum(item => item.Count);

    [Fact]
    public void GivesTheBestItemsInGeneration4()
    {
        var game = SaveFilePath.Load(SaveFilePath.HgSs);

        game.Trainer.Inventories.AddBestItems().Should().Be(15);

        foreach (var name in new[] { "Rare Candy", "Master Ball", "Max Repel", "Full Restore", "Max Revive", "Full Heal" })
            CountOf(game, name).Should().Be(995, name);
        foreach (var name in new[] { "Fire Stone", "Water Stone", "Thunder Stone", "Leaf Stone", "Moon Stone", "Sun Stone", "Dawn Stone", "Dusk Stone", "Shiny Stone" })
            CountOf(game, name).Should().Be(10, name);
    }

    [Fact]
    public void SkipsWhatTheSaveHasNoPouchFor()
    {
        var game = SaveFilePath.Load(SaveFilePath.Emerald);

        var added = game.Trainer.Inventories.AddBestItems();

        added.Should().BeInRange(1, 14);
        CountOf(game, "Dawn Stone").Should().Be(0);
    }
}
