using System.Reflection;
using PKHeX.Core;
using PKHeX.Facade.Repositories;

namespace PKHeX.Facade;

internal sealed record CompetitiveSet(int Species, int Nature, int Ability, int HeldItem);

internal static class CompetitiveSets
{
    private const string ResourceName = "gen4_competitive_sets.csv";

    // PKHeX names this item by its Generation 8 name.
    private static readonly Dictionary<string, string> ItemAliases = new() { ["Stick"] = "Leek" };

    private static readonly Lazy<IReadOnlyDictionary<int, CompetitiveSet>> Sets = new(Load);

    public static CompetitiveSet? For(int species) => Sets.Value.GetValueOrDefault(species);

    public static int Count => Sets.Value.Count;

    private static IReadOnlyDictionary<int, CompetitiveSet> Load()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"The {ResourceName} resource is missing.");
        using var reader = new StreamReader(stream);

        var header = reader.ReadLine()?.Split(',') ?? [];
        var column = header.Select((name, index) => (name, index)).ToDictionary(c => c.name, c => c.index);

        var sets = new Dictionary<int, CompetitiveSet>();
        while (reader.ReadLine() is { Length: > 0 } line)
        {
            var cells = line.Split(',');
            string Cell(string name) => cells[column[name]].Trim();

            var species = int.Parse(Cell("number"));
            sets[species] = new CompetitiveSet(species, NatureId(Cell("nature")), AbilityId(Cell("ability")), ItemId(Cell("held_item")));
        }

        return sets;
    }

    private static int NatureId(string name) => Enum.TryParse<Nature>(name, ignoreCase: true, out var nature) && nature < Nature.Random
        ? (int)nature
        : throw new InvalidDataException($"Unknown nature '{name}' in {ResourceName}.");

    private static int AbilityId(string name)
    {
        var id = GameInfo.Strings.Ability
            .Select((ability, index) => (ability, index))
            .FirstOrDefault(entry => entry.ability.Equals(name, StringComparison.OrdinalIgnoreCase)).index;
        return id > 0 ? id : throw new InvalidDataException($"Unknown ability '{name}' in {ResourceName}.");
    }

    private static int ItemId(string name)
    {
        var item = ItemRepository.GetItemByName(ItemAliases.GetValueOrDefault(name, name));
        return item is { IsNone: false } ? item.Id : throw new InvalidDataException($"Unknown held item '{name}' in {ResourceName}.");
    }
}
