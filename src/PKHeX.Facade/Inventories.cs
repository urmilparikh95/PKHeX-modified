using System.Collections.Immutable;
using PKHeX.Core;

namespace PKHeX.Facade;

public class Inventories
{
    private readonly Game _game;
    // A pouch commits the whole bag, so every pouch shares one bag to keep edits to the others.
    private readonly Lazy<PlayerBag> _bag;

    public Inventories(Game game)
    {
        _game = game;
        _bag = new Lazy<PlayerBag>(() => game.SaveFile.Inventory);

        InventoryTypes = GetInventoryTypes();
        InventoryItems = GetInventories();
    }

    public Inventory this[string key]
    {
        get
        {
            if (InventoryItems.ContainsKey(key))
            {
                return InventoryItems[key];
            }
            else
            {
                throw new KeyNotFoundException($"The inventory '{key}' does not exist.");
            }
        }
    }


    public ImmutableHashSet<string> InventoryTypes { get; init; }
    public ImmutableDictionary<string, Inventory> InventoryItems { get; init; }

    private static readonly (string Name, int Count)[] BestItems =
    [
        ("Rare Candy", 995), ("Master Ball", 995), ("Max Repel", 995), ("Full Restore", 995), ("Max Revive", 995), ("Full Heal", 995),
        ("Fire Stone", 10), ("Water Stone", 10), ("Thunder Stone", 10), ("Leaf Stone", 10), ("Moon Stone", 10),
        ("Sun Stone", 10), ("Dawn Stone", 10), ("Dusk Stone", 10), ("Shiny Stone", 10),
    ];

    /// <summary>
    /// Gives 995 each of Rare Candy, Master Ball, Max Repel, Full Restore, Max Revive and Full Heal, and 10 of each evolution stone, in the pouch that holds each one.
    /// An item the save has no pouch for is skipped, a count above the pouch's limit is lowered to it, and an item that finds no free slot is skipped.
    /// </summary>
    /// <returns>How many kinds of item were set.</returns>
    public int AddBestItems()
    {
        var added = 0;
        foreach (var (name, count) in BestItems)
        {
            var id = GameInfo.Strings.Item
                .Select((itemName, index) => (itemName, index))
                .FirstOrDefault(entry => entry.itemName == name).index;
            if (id <= 0) continue;

            var itemId = (ushort)id;
            var pouch = InventoryItems.Values.FirstOrDefault(inventory => inventory.CanSet(itemId));
            if (pouch is null) continue;

            if (pouch.TrySet(itemId, (uint)Math.Min(count, pouch.MaxCountOf(itemId)))) added++;
        }

        return added;
    }

    // Bright Powder to Razor Fang is the held-item block of the Generation 4 item list. Oval Stone and the three orbs sit among the other Items pouch entries.
    private static readonly ushort[] HeldItems = [110, 112, 135, 136, .. Enumerable.Range(213, 115).Select(id => (ushort)id)];

    /// <summary>
    /// Gives one of each item a Pokémon holds, including the ones that make Pokémon evolve, in the Items pouch. Berries, mail and the other pouches aren't touched. Generation 4 only.
    /// An item the pouch already has keeps its count, and one the pouch has no free slot or support for is skipped.
    /// </summary>
    /// <returns>How many items were added.</returns>
    /// <exception cref="NotSupportedException">The save isn't Generation 4.</exception>
    public int AddHeldItems()
    {
        if (_game.Generation != EntityContext.Gen4) throw new NotSupportedException("Add Held Items only works on Generation 4 saves.");

        var pouch = this["Items"];
        var added = 0;
        foreach (var itemId in HeldItems)
        {
            if (!pouch.CanSet(itemId) || pouch.AllExceptNone().Any(item => item.Id == itemId)) continue;
            if (pouch.TrySet(itemId, 1)) added++;
        }

        return added;
    }

    private ImmutableHashSet<string> GetInventoryTypes()
    {
        try
        {
            return _bag.Value.Pouches.Select(i => i.Type.ToString()).ToImmutableHashSet();
        }
        catch (ArgumentOutOfRangeException) when (_game.SaveFile is SAV8LA)
        {
            // Blank Legends: Arceus saves have an item block with an unset type code, so PKHeX.Core throws reading it.
            return ImmutableHashSet<string>.Empty;
        }
    }

    private ImmutableDictionary<string, Inventory> GetInventories() => InventoryTypes.ToImmutableDictionary(
        type => type,
        type => new Inventory(type, _game, _bag.Value)
    );
}

public static class InventoriesExtensions
{
    public static IEnumerable<Inventory.Item> AllExceptNone(this Inventory inventory)
    {
        return inventory.Where(i => !i.IsNone);
    }
}