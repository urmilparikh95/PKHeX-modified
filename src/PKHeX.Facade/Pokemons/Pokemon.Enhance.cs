using PKHeX.Core;

namespace PKHeX.Facade.Pokemons;

public partial class Pokemon
{
    private const int EnhancedIv = 31;
    private const int EnhancedEv = 255;

    /// <summary>
    /// Sets every IV to 31 and every EV to 255, then the nature, ability and held item of the species' competitive set. Generation 4 only.
    /// Each part is applied on its own, so one the save can't store doesn't stop the others. EVs go past the 510 total the games allow, and PKHeX flags that as illegal.
    /// </summary>
    /// <returns>Whether anything changed: false for an empty or unknown Pokémon, outside Generation 4, and for a species without a set.</returns>
    public bool Enhance()
    {
        if (Game.Generation != EntityContext.Gen4 || IsEmpty || !IsEditable) return false;
        if (CompetitiveSets.For(Species.Id) is not { } set) return false;

        var changed = TryUpdate(new PokemonPatch(Nature: set.Nature));
        changed |= TryUpdate(new PokemonPatch(Ability: set.Ability));
        changed |= TryUpdate(new PokemonPatch(HeldItem: set.HeldItem));
        changed |= TryUpdate(new PokemonPatch(
            Ivs: new StatPatch(EnhancedIv, EnhancedIv, EnhancedIv, EnhancedIv, EnhancedIv, EnhancedIv),
            Evs: new StatPatch(EnhancedEv, EnhancedEv, EnhancedEv, EnhancedEv, EnhancedEv, EnhancedEv)));
        return changed;
    }

    private bool TryUpdate(PokemonPatch patch)
    {
        try
        {
            Update(patch);
            return true;
        }
        catch (InvalidPatchException)
        {
            return false;
        }
    }
}
