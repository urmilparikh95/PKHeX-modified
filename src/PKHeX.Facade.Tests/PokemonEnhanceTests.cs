using AwesomeAssertions;
using PKHeX.Core;
using PKHeX.Facade.Tests.Base;

namespace PKHeX.Facade.Tests;

public class PokemonEnhanceTests
{
    [Fact]
    public void HasASetForEveryGeneration4Species()
    {
        CompetitiveSets.Count.Should().Be(493);
        Enumerable.Range(1, 493).Should().OnlyContain(species => CompetitiveSets.For(species) != null);
    }

    [Fact]
    public void MaxesIvsAndEvsAndAppliesTheSpeciesSet()
    {
        var pokemon = SaveFilePath.Load(SaveFilePath.HgSs).Trainer.Party.Members().First().Pokemon;
        var set = CompetitiveSets.For(pokemon.Species.Id)!;

        pokemon.Enhance().Should().BeTrue();

        var pkm = pokemon.Pkm;
        new[] { pkm.IV_HP, pkm.IV_ATK, pkm.IV_DEF, pkm.IV_SPA, pkm.IV_SPD, pkm.IV_SPE }.Should().OnlyContain(iv => iv == 31);
        new[] { pkm.EV_HP, pkm.EV_ATK, pkm.EV_DEF, pkm.EV_SPA, pkm.EV_SPD, pkm.EV_SPE }.Should().OnlyContain(ev => ev == 255);
        ((int)pkm.Nature).Should().Be(set.Nature);
        pkm.Ability.Should().Be(set.Ability);
        pkm.HeldItem.Should().Be(set.HeldItem);
    }

    [Fact]
    public void EnhancesEveryPokemonInThePartyAndTheBoxes()
    {
        var trainer = SaveFilePath.Load(SaveFilePath.HgSs).Trainer;
        var expected = trainer.Party.Members().Count() + trainer.PokemonBox.Boxed().Count();

        trainer.EnhanceAll().Should().Be(expected);

        var everyone = trainer.Party.Members().Select(m => m.Pokemon).Concat(trainer.PokemonBox.Boxed().Select(b => b.Pokemon));
        everyone.Should().OnlyContain(p => p.Pkm.IV_HP == 31 && p.Pkm.EV_SPE == 255);
    }

    [Fact]
    public void SetsTheSpeciesMovesWithMaxPp()
    {
        var pokemon = SaveFilePath.Load(SaveFilePath.HgSs).Trainer.Party.Members().First().Pokemon;
        var set = CompetitiveSets.For(pokemon.Species.Id)!;

        pokemon.EnhanceMoveset().Should().BeTrue();

        var pkm = pokemon.Pkm;
        pkm.Moves.Should().Equal(set.Moves);
        var slots = new[] { (pkm.Move1, pkm.Move1_PP, pkm.Move1_PPUps), (pkm.Move2, pkm.Move2_PP, pkm.Move2_PPUps), (pkm.Move3, pkm.Move3_PP, pkm.Move3_PPUps), (pkm.Move4, pkm.Move4_PP, pkm.Move4_PPUps) };
        foreach (var (move, pp, ups) in slots.Where(slot => slot.Item1 != 0))
        {
            ups.Should().Be(3);
            pp.Should().Be(pkm.GetMovePP((ushort)move, 3));
        }
    }

    [Fact]
    public void HyperBeamGetsEightPp()
    {
        var pokemon = SaveFilePath.Load(SaveFilePath.HgSs).Trainer.Party.Members().First().Pokemon;
        pokemon.Pkm.SetMoves(new[] { (ushort)Move.HyperBeam, (ushort)0, (ushort)0, (ushort)0 }, maxPP: true);

        pokemon.Pkm.Move1_PP.Should().Be(8);
    }

    [Fact]
    public void KeepsEverySetMoveInGeneration4()
    {
        Enumerable.Range(1, 493).Select(species => CompetitiveSets.For(species)!)
            .SelectMany(set => set.Moves)
            .Should().OnlyContain(move => move <= 467);
    }

    [Fact]
    public void DoesNothingOutsideGeneration4()
    {
        var game = SaveFilePath.Load(SaveFilePath.Emerald);

        game.Trainer.Party.Members().First().Pokemon.Enhance().Should().BeFalse();
        game.Trainer.Party.Members().First().Pokemon.EnhanceMoveset().Should().BeFalse();
        game.Trainer.Invoking(trainer => trainer.EnhanceAll()).Should().Throw<NotSupportedException>();
    }
}
