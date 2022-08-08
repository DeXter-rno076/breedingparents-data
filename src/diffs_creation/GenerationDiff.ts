import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { FileLoader } from '../file_managing/FileLoader';
import { FileSaver } from '../file_managing/FileSaver';
import Logger from '../Logger';
import { TunedPkmnJSON } from '../pkmn-data_adjustements/TunedPkmnJSON';
import { PlainPkmnDataset } from '../types';
import { PkmnDiff } from './PkmnDiff';
import { PkmnGameExclusives } from './PkmnGameExclusives';
import { PkmnGenSimilarities } from './PkmnGenSimilarities';

export class GenerationDiff {
    private gen: number;
    private plainDataSets: PlainPkmnDataset[];
    private similarities: Map<string, PkmnGenSimilarities>;
    private differences: Map<string, PkmnGameExclusives[]>;

    public constructor(gen: number) {
        this.gen = gen;

        this.similarities = new Map<string, PkmnGenSimilarities>();
        this.differences = new Map<string, PkmnGameExclusives[]>();
    }

    public createSimsAndDiffs() {
        Logger.statusLog('creating sims and diffs for gen ' + this.gen);
        this.plainDataSets = this.loadPlainPkmnDatasets();

        this.createPkmnDiffs();

        //todo names are inaccurate
        const finishedSimilarities = this.finishSimilarities();
        const finishedDifferences = this.finishDifferences();

        Logger.statusLog('saving sims and diffs for gen ' + this.gen);
        this.saveSimilarities(finishedSimilarities);
        this.saveDifferences(finishedDifferences);
    }

    private loadPlainPkmnDatasets(): PlainPkmnDataset[] {
        const plainPkmnDatasets: PlainPkmnDataset[] = [];
        const gameList = GamesPerGenUtils.getGamesOfGen(this.gen);

        for (const game of gameList) {
            const fileContent = FileLoader.getPlainGenPkmnDatasetByGame(game);
            const parsedJSON = JSON.parse(fileContent) as PlainPkmnDataset;
            plainPkmnDatasets.push(parsedJSON);
        }

        return plainPkmnDatasets;
    }

    private createPkmnDiffs() {
        const firstDataset = this.plainDataSets[0];
        for (const pkmnName of Object.keys(firstDataset)) {
            const plainDatasetsForPkmn = this.getPlainDatasetsForPkmn(pkmnName);

            const pkmnDiff = new PkmnDiff(pkmnName, plainDatasetsForPkmn);

            const diffsAndCommons = pkmnDiff.createSimsAndDiffs();

            this.similarities.set(pkmnName, diffsAndCommons.similarities);
            this.differences.set(pkmnName, diffsAndCommons.differences);
        }
    }

    private getPlainDatasetsForPkmn(pkmnName: string): TunedPkmnJSON[] {
        const plainDatasetsForPkmn: TunedPkmnJSON[] = [];

        for (const plainDataset of this.plainDataSets) {
            if (plainDataset[pkmnName] === undefined) {
                Logger.elog(pkmnName + ' doesnt exist in all datasets');
            } else {
                plainDatasetsForPkmn.push(plainDataset[pkmnName]);
            }
        }

        return plainDatasetsForPkmn;
    }

    private finishSimilarities(): { [key: string]: PkmnGenSimilarities } {
        return Object.fromEntries(this.similarities);
    }

    //todo split up
    private finishDifferences(): { [key: string]: PkmnGameExclusives }[] {
        const games = GamesPerGenUtils.getGamesOfGen(this.gen);
        const gameDifferences: Map<string, PkmnGameExclusives>[] = [];
        for (const game of games) {
            const gameDiffMap = new Map<string, PkmnGameExclusives>();
            this.differences.forEach(function (pkmnDiffs, pkmnName) {
                const gamePkmnDiff = pkmnDiffs.find((item) => {
                    return item.game === game;
                });
                if (gamePkmnDiff === undefined) {
                    Logger.elog(pkmnName + ' has no diff in ' + game);
                    return;
                }
                gameDiffMap.set(pkmnName, gamePkmnDiff);
            });
            gameDifferences.push(gameDiffMap);
        }

        const deepPlainObject: { [key: string]: PkmnGameExclusives }[] = [];
        for (const gameDiff of gameDifferences) {
            deepPlainObject.push(Object.fromEntries(gameDiff));
        }
        return deepPlainObject;
    }

    private saveSimilarities(similarities: { [key: string]: PkmnGenSimilarities }) {
        FileSaver.saveFinalDatasetPkmnCommons(this.gen, JSON.stringify(similarities));
    }

    private saveDifferences(differences: { [key: string]: PkmnGameExclusives }[]) {
        for (const gameDiff of differences) {
            if (gameDiff['Pikachu'] === undefined) {
                Logger.elog('diff of gen ' + this.gen + ' has no Pikachu');
                continue;
            }
            const game = gameDiff['Pikachu'].game;
            FileSaver.saveFinalDatasetPkmnExclusives(game, JSON.stringify(gameDiff));
        }
    }
}
