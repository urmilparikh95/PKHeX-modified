using PKHeX.Everywhere.Engine.Dtos;
using PKHeX.Facade;

namespace PKHeX.Everywhere.Engine.Handlers;

public static class InventoryHandlers
{
    [Query("inventory.get", Topics.Inventory)]
    public static Pouch[] Get(Game game) => game.Trainer.Inventories.InventoryItems.Values
        .OrderBy(inventory => inventory.Type, StringComparer.Ordinal)
        .Select(inventory => inventory.ToPouch())
        .ToArray();

    /// <summary>
    /// Gives 995 each of Rare Candy, Master Ball, Max Repel, Full Restore, Max Revive and Full Heal, and 10 of each evolution stone, in the pouch that holds each one.
    /// A count above what the pouch holds is lowered to it. An item the save has no pouch for, or no free slot for, is skipped. Returns how many kinds of item were set.
    /// </summary>
    [Requires(Requirement.Save)]
    [Command("inventory.addBestItems", Topics.Inventory)]
    public static int AddBestItems(Game game) => game.Trainer.Inventories.AddBestItems();

    [Command("inventory.setItem")]
    public static void SetItem(Session session, Game game, ItemHandle at, int count)
    {
        if (!game.Trainer.Inventories.InventoryItems.TryGetValue(at.Pouch, out var inventory))
            throw new EngineException(ErrorCodes.NotFound, $"The save has no {at.Pouch} pouch.");

        var owned = inventory.AllExceptNone().Any(item => item.Id == at.ItemId);
        var settable = at.ItemId is >= 0 and <= ushort.MaxValue && inventory.CanSet((ushort)at.ItemId);
        // Saves can hold items their pouch doesn't support (the Crystal test save has key item 255); removing them is allowed.
        if (!settable && !(owned && count == 0))
            throw new EngineException(ErrorCodes.BadArguments, $"The {at.Pouch} pouch doesn't support item {at.ItemId}.");

        var itemId = (ushort)at.ItemId;
        if (count == 0)
        {
            if (owned) inventory.Remove(itemId);
            session.Raise(new ItemChanged(at.ItemId, 0));
            return;
        }

        var maxCount = inventory.MaxCountOf(itemId);
        if (count < 0 || count > maxCount)
            throw new EngineException(ErrorCodes.OutOfRange, $"Count must be between 0 and {maxCount}, got {count}.");

        if (!inventory.TrySet(itemId, (uint)count))
            throw new EngineException(ErrorCodes.PouchFull, $"The {at.Pouch} pouch has no free slot.");

        session.Raise(new ItemChanged(at.ItemId, count));
    }
}
