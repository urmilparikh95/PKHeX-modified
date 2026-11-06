using AwesomeAssertions;
using PKHeX.Facade.Repositories;
using PKHeX.Facade.Tests.Base;

namespace PKHeX.Facade.Tests;

public class BestItemsTests
{
    private static int CountOf(Game game, string name) => game.Trainer.Inventories.InventoryItems.Values
        .SelectMany(inventory => inventory.AllExceptNone())
        .Where(item => item.Name == name)
        .Sum(item => item.Count);

    [Fact]
    public void GivesTheBestItemsInGeneration4InTheirOwnPouches()
    {
        var game = SaveFilePath.Load(SaveFilePath.HgSs);

        game.Trainer.Inventories.AddBestItems().Should().Be(15);

        (string Name, string Pouch, int Count)[] expected =
        [
            ("Rare Candy", "Medicine", 995), ("Full Restore", "Medicine", 995), ("Max Revive", "Medicine", 995), ("Full Heal", "Medicine", 995),
            ("Master Ball", "Balls", 995), ("Max Repel", "Items", 995),
            ("Fire Stone", "Items", 10), ("Water Stone", "Items", 10), ("Thunder Stone", "Items", 10), ("Leaf Stone", "Items", 10), ("Moon Stone", "Items", 10),
            ("Sun Stone", "Items", 10), ("Dawn Stone", "Items", 10), ("Dusk Stone", "Items", 10), ("Shiny Stone", "Items", 10),
        ];
        foreach (var (name, pouch, count) in expected)
            game.Trainer.Inventories[pouch].AllExceptNone().Where(item => item.Name == name).Sum(item => item.Count).Should().Be(count, $"{name} in {pouch}");
    }

    [Fact]
    public void GivesEveryHeldItemInTheItemsPouchAndNoBerries()
    {
        var game = SaveFilePath.Load(SaveFilePath.HgSs);
        var inventories = game.Trainer.Inventories;
        var berriesBefore = inventories["Berries"].AllExceptNone().Select(item => (item.Id, item.Count)).ToList();

        inventories.AddHeldItems().Should().BeGreaterThan(0);

        var owned = inventories["Items"].AllExceptNone().Select(item => item.Name).ToHashSet();
        owned.Should().Contain(["Leftovers", "Choice Band", "Choice Scarf", "Choice Specs", "Life Orb", "Focus Sash", "Lucky Egg", "Metal Coat", "King’s Rock", "Dragon Scale", "Deep Sea Tooth", "Deep Sea Scale", "Upgrade", "Protector", "Electirizer", "Magmarizer", "Dubious Disc", "Reaper Cloth", "Razor Claw", "Razor Fang", "Oval Stone", "Griseous Orb", "Adamant Orb", "Lustrous Orb", "Flame Plate", "Iron Plate"]);
        inventories["Berries"].AllExceptNone().Select(item => (item.Id, item.Count)).Should().Equal(berriesBefore);
    }

    [Fact]
    public void KeepsTheCountOfAHeldItemTheBagAlreadyHas()
    {
        var game = SaveFilePath.Load(SaveFilePath.HgSs);
        var items = game.Trainer.Inventories["Items"];
        var leftovers = ItemRepository.GetItemByName("Leftovers")!.Id;
        items.TrySet(leftovers, 7);

        game.Trainer.Inventories.AddHeldItems();

        items.AllExceptNone().Single(item => item.Id == leftovers).Count.Should().Be(7);
    }

    [Fact]
    public void RefusesHeldItemsOutsideGeneration4()
    {
        var game = SaveFilePath.Load(SaveFilePath.Emerald);

        game.Trainer.Inventories.Invoking(inventories => inventories.AddHeldItems()).Should().Throw<NotSupportedException>();
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
