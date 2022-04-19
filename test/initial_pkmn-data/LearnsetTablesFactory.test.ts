import assert from 'assert';
import { LearnsetType } from '../../src/types';
import { LearnsetTable } from './LearnsetTable';
import { LearnsetTablesFactory } from '../../src/initial_pkmn-data/LearnsetTablesFactory';
import { Pkmn } from '../../src/initial_pkmn-data/Pkmn';
import { PkmnFactory } from '../../src/initial_pkmn-data/PkmnFactory';

describe('LearnsetTablesFactory', function () {
    describe('selected normal cases', function () {
        describe('pikachu in SW', function () {
            const pkmnFactory = new PkmnFactory('Pikachu', 'SW');
            let pkmn: Pkmn;
            let learnsetTablesFactory: LearnsetTablesFactory;
            let learnsetTables: LearnsetTable[];

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                learnsetTables = await learnsetTablesFactory.construct();
            });

            it('has 5 learnset tables', function () {
                assert.equal(learnsetTables.length, 5);
            });

            it('has level learnset table', function () {
                assert.notEqual(findTableWithType(learnsetTables, 'Level'), undefined);
            });
            it('has tmtp learnset table', function () {
                assert.notEqual(findTableWithType(learnsetTables, 'TMTP'), undefined);
            });
            it('has breeding learnset table', function () {
                assert.notEqual(findTableWithType(learnsetTables, 'Zucht'), undefined);
            });
            it('has tutor learnset table', function () {
                assert.notEqual(findTableWithType(learnsetTables, 'Lehrer'), undefined);
            });
            it('has events learnset table', function () {
                assert.notEqual(findTableWithType(learnsetTables, 'Event'), undefined);
            });
            it('has no kampfexklusiv learnset table', function () {
                assert.equal(findTableWithType(learnsetTables, 'Kampfexklusiv'), undefined);
            });
            it('has no meisterung learnset table', function () {
                assert.equal(findTableWithType(learnsetTables, 'Meisterung'), undefined);
            });

            it('has 20 level learnsets', function () {
                const learnsetTable = findTableWithType(learnsetTables, 'Level');
                const moveNames = learnsetTable.getMoveNames();
                assert.equal(moveNames.length, 20);
            });
            it('has 42 tmtp learnsets', function () {
                const learnsetTable = findTableWithType(learnsetTables, 'TMTP');
                const moveNames = learnsetTable.getMoveNames();
                assert.equal(moveNames.length, 42);
            });
            it('has 7 breeding learnsets', function () {
                const learnsetTable = findTableWithType(learnsetTables, 'Zucht');
                const moveNames = learnsetTable.getMoveNames();
                assert.equal(moveNames.length, 7);
            });
            it('has 1 tutor learnset', function () {
                const learnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                const moveNames = learnsetTable.getMoveNames();
                assert.equal(moveNames.length, 1);
            });
            it('has 4 event learnsets', function () {
                const learnsetTable = findTableWithType(learnsetTables, 'Event');
                const moveNames = learnsetTable.getMoveNames();
                assert.equal(moveNames.length, 4);
            });

            it('has no empty move names', function () {
                assert.ok(noEmptyMoveNames(learnsetTables));
            });

            it('has at least first 10 level learnsets right', function () {
                const levelLearnsetTable = findTableWithType(learnsetTables, 'Level');
                const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                const expected = [
                    'Kameradschaft',
                    'Bitterkuss',
                    'Wangenrubbler',
                    'Ränkeschmied',
                    'Charme',
                    'Donnerschock',
                    'Rutenschlag',
                    'Heuler',
                    'Ruckzuckhieb',
                    'Donnerwelle',
                ];
                assert.deepStrictEqual(actual, expected);
            });

            it('has at least first 10 tmtp learnsets right', function () {
                const levelLearnsetTable = findTableWithType(learnsetTables, 'TMTP');
                const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                const expected = [
                    'Megahieb',
                    'Megakick',
                    'Zahltag',
                    'Donnerschlag',
                    'Donnerwelle',
                    'Schaufler',
                    'Lichtschild',
                    'Reflektor',
                    'Erholung',
                    'Raub',
                ];
                assert.deepStrictEqual(actual, expected);
            });

            it('has at least first 10 breeding learnsets right', function () {
                const levelLearnsetTable = findTableWithType(learnsetTables, 'Zucht');
                const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                const expected = [
                    'Geschenk',
                    'Wunschtraum',
                    'Ladevorgang',
                    'Mogelhieb',
                    'Spaßkanone',
                    'Dreschflegel',
                    'Säuselstimme',
                ];
                assert.deepStrictEqual(actual, expected);
            });

            it('has at least first 10 tutor learnsets right', function () {
                const levelLearnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                const expected = ['Hochspannung'];
                assert.deepStrictEqual(actual, expected);
            });

            it('has at least first 10 event learnsets right', function () {
                const levelLearnsetTable = findTableWithType(learnsetTables, 'Event');
                const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                const expected = ['Ehrentag', 'Volttackle', 'Wunschtraum', 'Gesang'];
                assert.deepStrictEqual(actual, expected);
            });
        });

        describe.skip('Admurai in SW', function () {
            const pkmnFactory = new PkmnFactory('Admurai', 'SW');
            let pkmn: Pkmn;
            let learnsetTablesFactory: LearnsetTablesFactory;
            let learnsetTables: LearnsetTable[];

            this.beforeAll(async function () {
                pkmn = await pkmnFactory.construct();
                learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                learnsetTables = await learnsetTablesFactory.construct();
            });
        });

        describe('Botogel in Black', function () {});

        describe('Glumanda in Blue', function () {});
        //todo Pkmn in BDSP -> test inclusion of game specific learnsets
    });

    describe('selected special cases', function () {
        describe('seperated sections', function () {
            describe('Pantimos', function () {
                this.timeout(5000);
                const pkmnFactory = new PkmnFactory('Pantimos', 'SW');
                let pkmn: Pkmn;
                let learnsetTablesFactory: LearnsetTablesFactory;
                let learnsetTables: LearnsetTable[];

                this.beforeAll(async function () {
                    pkmn = await pkmnFactory.construct();
                    learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                    learnsetTables = await learnsetTablesFactory.construct();
                });

                it('has 4 learnset tables', function () {
                    assert.equal(learnsetTables.length, 4);
                });

                it('has level learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Level'), undefined);
                });
                it('has tmtp learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'TMTP'), undefined);
                });
                it('has breeding learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Zucht'), undefined);
                });
                it('has tutor learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Lehrer'), undefined);
                });
                it('has no events learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Event'), undefined);
                });
                it('has no kampfexklusiv learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Kampfexklusiv'), undefined);
                });
                it('has no meisterung learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Meisterung'), undefined);
                });

                it('has 21 level learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Level');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 21);
                });
                it('has 65 tmtp learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 65);
                });
                it('has 5 breeding learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 5);
                });
                it('has 1 tutor learnset', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 1);
                });

                it('has no empty move names', function () {
                    assert.ok(noEmptyMoveNames(learnsetTables));
                });

                it('has at least first 10 level learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Level');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Rapidschutz',
                        'Rundumschutz',
                        'Krafttausch',
                        'Schutztausch',
                        'Klaps',
                        'Imitator',
                        'Stafette',
                        'Zugabe',
                        'Konfusion',
                        'Rollenspiel',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tmtp learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Megahieb',
                        'Megakick',
                        'Feuerschlag',
                        'Eishieb',
                        'Donnerschlag',
                        'Hyperstrahl',
                        'Gigastoß',
                        'Zauberblatt',
                        'Solarstrahl',
                        'Donnerwelle',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 breeding learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Hypnose', 'Mogelhieb', 'Konfusstrahl', 'Kraftteiler', 'Spaßkanone'];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tutor learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Flächenmacht'];
                    assert.deepStrictEqual(actual, expected);
                });
            });
            describe('Galar-Pantimos', function () {
                this.timeout(5000);

                const pkmnFactory = new PkmnFactory('Galar-Pantimos', 'SW');
                let pkmn: Pkmn;
                let learnsetTablesFactory: LearnsetTablesFactory;
                let learnsetTables: LearnsetTable[];

                this.beforeAll(async function () {
                    pkmn = await pkmnFactory.construct();
                    learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                    learnsetTables = await learnsetTablesFactory.construct();
                });

                it('has 4 learnset tables', function () {
                    assert.equal(learnsetTables.length, 4);
                });

                it('has level learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Level'), undefined);
                });
                it('has tmtp learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'TMTP'), undefined);
                });
                it('has breeding learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Zucht'), undefined);
                });
                it('has tutor learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Lehrer'), undefined);
                });
                it('has no events learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Event'), undefined);
                });
                it('has no kampfexklusiv learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Kampfexklusiv'), undefined);
                });
                it('has no meisterung learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Meisterung'), undefined);
                });

                it('has 26 level learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Level');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 26);
                });
                it('has 68 tmtp learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 68);
                });
                it('has 4 breeding learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 4);
                });
                it('has 2 tutor learnset', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 2);
                });

                it('has no empty move names', function () {
                    assert.ok(noEmptyMoveNames(learnsetTables));
                });

                it('has at least first 10 level learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Level');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Imitator',
                        'Zugabe',
                        'Rollenspiel',
                        'Schutzschild',
                        'Aufbereitung',
                        'Mimikry',
                        'Lichtschild',
                        'Reflektor',
                        'Bodyguard',
                        'Zauberschein',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tmtp learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Megahieb',
                        'Megakick',
                        'Eishieb',
                        'Hyperstrahl',
                        'Gigastoß',
                        'Solarstrahl',
                        'Donnerwelle',
                        'Kreideschrei',
                        'Lichtschild',
                        'Reflektor',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 breeding learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Mogelhieb', 'Konfusstrahl', 'Kraftteiler', 'Spaßkanone'];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tutor learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Dreifach-Axel', 'Flächenmacht'];
                    assert.deepStrictEqual(actual, expected);
                });
            });
        });
        describe('fused section', function () {
            describe('Flegmon in SW', function () {
                const pkmnFactory = new PkmnFactory('Flegmon', 'SW');
                let pkmn: Pkmn;
                let learnsetTablesFactory: LearnsetTablesFactory;
                let learnsetTables: LearnsetTable[];

                this.beforeAll(async function () {
                    pkmn = await pkmnFactory.construct();
                    learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                    learnsetTables = await learnsetTablesFactory.construct();
                });

                it('has 4 learnset tables', function () {
                    assert.equal(learnsetTables.length, 4);
                });

                it('has level learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Level'), undefined);
                });
                it('has tmtp learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'TMTP'), undefined);
                });
                it('has breeding learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Zucht'), undefined);
                });
                it('has tutor learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Lehrer'), undefined);
                });
                it('has no events learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Event'), undefined);
                });
                it('has no kampfexklusiv learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Kampfexklusiv'), undefined);
                });
                it('has no meisterung learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Meisterung'), undefined);
                });

                it('has 17 level learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Level');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 17);
                });
                it('has 52 tmtp learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 52);
                });
                it('has 4 breeding learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 4);
                });
                it('has 1 tutor learnset', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 1);
                });

                it('has no empty move names', function () {
                    assert.ok(noEmptyMoveNames(learnsetTables));
                });

                it('has at least first 10 level learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Level');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Tackle',
                        'Fluch',
                        'Heuler',
                        'Aquaknarre',
                        'Gähner',
                        'Konfusion',
                        'Aussetzer',
                        'Aquawelle',
                        'Kopfnuss',
                        'Zen-Kopfstoß',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tmtp learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Zahltag',
                        'Donnerwelle',
                        'Schaufler',
                        'Lichtschild',
                        'Bodyguard',
                        'Erholung',
                        'Schnarcher',
                        'Schutzschild',
                        'Eissturm',
                        'Anziehung',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 breeding learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Bauchtrommel', 'Rückentzug', 'Rülpser', 'Stampfer'];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tutor learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Flächenmacht'];
                    assert.deepStrictEqual(actual, expected);
                });
            });

            describe('Galar-Flegmon in SW', function () {
                const pkmnFactory = new PkmnFactory('Galar-Flegmon', 'SW');
                let pkmn: Pkmn;
                let learnsetTablesFactory: LearnsetTablesFactory;
                let learnsetTables: LearnsetTable[];

                this.beforeAll(async function () {
                    pkmn = await pkmnFactory.construct();
                    learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
                    learnsetTables = await learnsetTablesFactory.construct();
                });

                it('has 4 learnset tables', function () {
                    assert.equal(learnsetTables.length, 4);
                });

                it('has level learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Level'), undefined);
                });
                it('has tmtp learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'TMTP'), undefined);
                });
                it('has breeding learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Zucht'), undefined);
                });
                it('has tutor learnset table', function () {
                    assert.notEqual(findTableWithType(learnsetTables, 'Lehrer'), undefined);
                });
                it('has no events learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Event'), undefined);
                });
                it('has no kampfexklusiv learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Kampfexklusiv'), undefined);
                });
                it('has no meisterung learnset table', function () {
                    assert.equal(findTableWithType(learnsetTables, 'Meisterung'), undefined);
                });

                it('has 17 level learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Level');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 17);
                });
                it('has 53 tmtp learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 53);
                });
                it('has 4 breeding learnsets', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 4);
                });
                it('has 1 tutor learnset', function () {
                    const learnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const moveNames = learnsetTable.getMoveNames();
                    assert.equal(moveNames.length, 1);
                });

                it('has no empty move names', function () {
                    assert.ok(noEmptyMoveNames(learnsetTables));
                });

                it('has at least first 10 level learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Level');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Tackle',
                        'Fluch',
                        'Heuler',
                        'Säure',
                        'Gähner',
                        'Konfusion',
                        'Aussetzer',
                        'Aquawelle',
                        'Kopfnuss',
                        'Zen-Kopfstoß',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tmtp learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'TMTP');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = [
                        'Zahltag',
                        'Donnerwelle',
                        'Schaufler',
                        'Lichtschild',
                        'Bodyguard',
                        'Erholung',
                        'Schnarcher',
                        'Schutzschild',
                        'Eissturm',
                        'Anziehung',
                    ];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 breeding learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Zucht');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Bauchtrommel', 'Rückentzug', 'Rülpser', 'Stampfer'];
                    assert.deepStrictEqual(actual, expected);
                });
                it('has at least first 10 tutor learnsets right', function () {
                    const levelLearnsetTable = findTableWithType(learnsetTables, 'Lehrer');
                    const actual = levelLearnsetTable.getMoveNames().slice(0, 10);
                    const expected = ['Flächenmacht'];
                    assert.deepStrictEqual(actual, expected);
                });
            });
        });
    });
});

function findTableWithType(learnsetTables: LearnsetTable[], learnsetType: LearnsetType): LearnsetTable | undefined {
    return learnsetTables.find((table) => {
        return table.getLearnsetType() === learnsetType;
    });
}

function noEmptyMoveNames(learnsetTables: LearnsetTable[]): boolean {
    for (const learnsetTable of learnsetTables) {
        const moveNames = learnsetTable.getMoveNames();
        if (!noEmptyMoveNamesInLearnsetList(moveNames)) {
            return false;
        }
    }

    return true;
}

function noEmptyMoveNamesInLearnsetList(moveNames: string[]): boolean {
    let noEmptyNames = true;

    for (const moveName of moveNames) {
        if (moveName.length === 0) {
            noEmptyNames = false;
        }
    }

    return noEmptyNames;
}
