import assert from 'assert';
import { PkmnFactory } from '../../src/initial_pkmn-data/PkmnFactory';

/**
 * todo test wrong inputs / throwing errors
 */

describe('PkmnFactory', function () {
    describe('selected normal forms', function () {
        describe('pikachu in LP', function () {
            const pkmnFactory = new PkmnFactory('Pikachu', 'LP');
            let pkmn;
            let pkmnJSON;

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                pkmnJSON = pkmn.toDatasetJSON();
            });

            it('has game LP', function () {
                assert.equal(pkmnJSON.game, 'LP');
            });
            it('has name Pikachu', function () {
                assert.equal(pkmnJSON.name, 'Pikachu');
            });
            it('has id #025', function () {
                assert.equal(pkmnJSON.id, '025');
            });
            it('has gender both', function () {
                assert.equal(pkmnJSON.gender, 'both');
            });
            it('has eggGroup1 Feld', function () {
                assert.equal(pkmnJSON.eggGroup1, 'Feld');
            });
            it('has egg group 2 Fee', function () {
                assert.equal(pkmnJSON.eggGroup2, 'Fee');
            });
        });
    });

    describe('selected special forms', function () {
        describe('normal moewth in SW (normal form with special forms)', function () {
            const pkmnFactory = new PkmnFactory('Mauzi', 'SW');
            let jsonPkmn;

            this.beforeAll(async function () {
                const pkmn = await pkmnFactory.construct();
                jsonPkmn = pkmn.toDatasetJSON();
            });

            it('has game SW', function () {
                assert.equal(jsonPkmn.game, 'SW');
            });
            it('has name Mauzi', function () {
                assert.equal(jsonPkmn.name, 'Mauzi');
            });
            it('has id #052', function () {
                assert.equal(jsonPkmn.id, '052');
            });
            it('has gender both', function () {
                assert.equal(jsonPkmn.gender, 'both');
            });
            it('has egg group Feld', function () {
                assert.equal(jsonPkmn.eggGroup1, 'Feld');
            });
            it('has no second egg group', function () {
                assert.equal(jsonPkmn.eggGroup2, '');
            });
        });
        describe('galarian meowth in SW (separated sections)', function () {
            const pkmnFactory = new PkmnFactory('Galar-Mauzi', 'SW');
            let pkmn;
            let pkmnJSON;

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                pkmnJSON = pkmn.toDatasetJSON();
            });

            it('has game SW', function () {
                assert.equal(pkmnJSON.game, 'SW');
            });
            it('has name Galar-Mauzi', function () {
                assert.equal(pkmnJSON.name, 'Galar-Mauzi');
            });
            it('has id #052b', function () {
                assert.equal(pkmnJSON.id, '052b');
            });
            it('has gender both', function () {
                assert.equal(pkmnJSON.gender, 'both');
            });
            it('has egg group 1 Feld', function () {
                assert.equal(pkmnJSON.eggGroup1, 'Feld');
            });
            it('has no egg group 2', function () {
                assert.equal(pkmnJSON.eggGroup2, '');
            });
        });

        describe('alolan meowth in Sun (fused sections)', function () {
            const pkmnFactory = new PkmnFactory('Alola-Mauzi', 'So');
            let jsonPkmn;

            this.beforeAll(async function () {
                jsonPkmn = await pkmnFactory.construct();
            });

            it('has game Sun', function () {
                assert.equal(jsonPkmn.game, 'So');
            });
            it('has name Alola-Mauzi', function () {
                assert.equal(jsonPkmn.name, 'Alola-Mauzi');
            });
            it('has id #052a', function () {
                assert.equal(jsonPkmn.id, '052a');
            });
            it('has gender both', function () {
                assert.equal(jsonPkmn.gender, 'both');
            });
            it('has egg group Feld', function () {
                assert.equal(jsonPkmn.eggGroup1, 'Feld');
            });
            it('has no second egg group', function () {
                assert.equal(jsonPkmn.eggGroup2, '');
            });
        });
    });

    describe('gender edge cases', function () {
        describe('female only', function () {
            const pkmnFactory = new PkmnFactory('Miltank', 'SW');
            let pkmn;
            let JSONpkmn;

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                JSONpkmn = pkmn.toDatasetJSON();
            });

            it('Miltank is female only', function () {
                assert.equal(JSONpkmn.gender, 'female');
            });
        });

        describe('male only', function () {
            const pkmnFactory = new PkmnFactory('Tauros', 'SW');
            let pkmn;
            let jsonPkmn;

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                jsonPkmn = pkmn.toDatasetJSON();
            });

            it('Tauros is male only', function () {
                assert.equal(jsonPkmn.gender, 'male');
            });
        });

        describe('unknown', function () {
            const pkmnFactory = new PkmnFactory('Arceus', 'SD');
            let pkmn;
            let jsonPkmn;

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                jsonPkmn = pkmn.toDatasetJSON();
            });

            it('Arceus has gender unknown', function () {
                assert.equal(jsonPkmn.gender, 'unknown');
            });
        });
    });

    describe('egg group special cases', function () {
        describe('egg group changes', function () {
            describe('galagladi', function () {
                const pkmnFactorySW = new PkmnFactory('Galagladi', 'SW');
                const pkmnFactoryBlack = new PkmnFactory('Galagladi', 'Sc');
                let jsonPkmnSW;
                let jsonPkmnBlack;

                this.beforeAll(async function () {
                    const pkmnSW = await pkmnFactorySW.construct();
                    const pkmnBlack = await pkmnFactoryBlack.construct();

                    jsonPkmnSW = pkmnSW.toDatasetJSON();
                    jsonPkmnBlack = pkmnBlack.toDatasetJSON();
                });

                it('should have egg groups Humonotyp and Amorph in SW', function () {
                    assert.equal(jsonPkmnSW.eggGroup1, 'Humanotyp');
                    assert.equal(jsonPkmnSW.eggGroup2, 'Amorph');
                });

                it('should have only Amorph in Black', function () {
                    assert.equal(jsonPkmnBlack.eggGroup1, '');
                    assert.equal(jsonPkmnBlack.eggGroup2, 'Amorph');
                });
            });
        });
    });
});
