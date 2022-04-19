import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { TunedPkmnJSON } from '../pkmn-data_adjustements/TunedPkmnJSON';
import { PkmnGameExclusives } from './PkmnGameExclusives';
import { PkmnGenSimilarities } from './PkmnGenSimilarities';

export class PkmnDiff {
    private pkmnName: string;
    private plainPkmnDatasets: TunedPkmnJSON[];

    public constructor(pkmnName: string, plainDatasets: TunedPkmnJSON[]) {
        this.pkmnName = pkmnName;
        this.plainPkmnDatasets = plainDatasets;
    }

    public createSimsAndDiffs(): { similarities: PkmnGenSimilarities; differences: PkmnGameExclusives[] } {
        const similarities = this.createSimilarities();
        const differences = this.createDifferences(similarities);

        return {
            similarities,
            differences,
        };
    }

    private createSimilarities(): PkmnGenSimilarities {
        const similaritiesDraft = this.initSimilarities();
        const finalSimilarities = this.removeGameExclusiveLearnsets(similaritiesDraft);
        return finalSimilarities;
    }

    private initSimilarities(): PkmnGenSimilarities {
        if (this.plainPkmnDatasets.length === 0) {
            throw 'todo';
        }

        const firstExistantPkmnDataset = this.getFirstExistantPkmnDataset(this.plainPkmnDatasets);
        const similarities: PkmnGenSimilarities = {
            gen: this.getGen(),
            name: this.pkmnName,
            id: firstExistantPkmnDataset.id,
            directLearnsets: firstExistantPkmnDataset.directLearnsets,
            breedingLearnsets: firstExistantPkmnDataset.breedingLearnsets,
            eventLearnsets: firstExistantPkmnDataset.eventLearnsets,
            oldGenLearnsets: firstExistantPkmnDataset.oldGenLearnsets,
        };

        return similarities;
    }

    private getFirstExistantPkmnDataset(pkmnDatasets: TunedPkmnJSON[]): TunedPkmnJSON {
        for (const pkmnDataset of pkmnDatasets) {
            if (pkmnDataset.exists) {
                return pkmnDataset;
            }
        }
        return pkmnDatasets[0];
    }

    private getGen(): number {
        const firstDataset = this.plainPkmnDatasets[0];
        const firstGame = firstDataset.game;
        const gen = GamesPerGenUtils.gameToGenNumber(firstGame);
        return gen;
    }

    private removeGameExclusiveLearnsets(similaritiesDraft: PkmnGenSimilarities): PkmnGenSimilarities {
        similaritiesDraft.directLearnsets = this.getLearnsetSimilarities(similaritiesDraft, 'directLearnsets');
        similaritiesDraft.breedingLearnsets = this.getLearnsetSimilarities(similaritiesDraft, 'breedingLearnsets');
        similaritiesDraft.eventLearnsets = this.getLearnsetSimilarities(similaritiesDraft, 'eventLearnsets');
        similaritiesDraft.oldGenLearnsets = this.getLearnsetSimilarities(similaritiesDraft, 'oldGenLearnsets');

        return similaritiesDraft;
    }

    /**
     * todo learnsetType param is unclean
     */
    private getLearnsetSimilarities(similaritiesDraft: PkmnGenSimilarities, learnsetType: string): string[] {
        const existantDatasets = this.getExistantPkmnDatasets(this.plainPkmnDatasets);
        let currentLearnsetSimilarities = similaritiesDraft[learnsetType];

        for (let i = 1; i < existantDatasets.length; i++) {
            const pkmnDataset = existantDatasets[i];
            currentLearnsetSimilarities = this.getListInterception(
                currentLearnsetSimilarities,
                pkmnDataset[learnsetType]
            );
        }

        return currentLearnsetSimilarities;
    }

    private getExistantPkmnDatasets(pkmnDatasets: TunedPkmnJSON[]): TunedPkmnJSON[] {
        return pkmnDatasets.filter((item) => {
            return item.exists;
        });
    }

    private getListInterception(a: string[], b: string[]): string[] {
        const interception: string[] = [];
        for (const item of a) {
            if (b.includes(item)) {
                interception.push(item);
            }
        }
        return interception;
    }

    private createDifferences(similarities: PkmnGenSimilarities): PkmnGameExclusives[] {
        const differences: PkmnGameExclusives[] = [];
        for (let i = 0; i < this.plainPkmnDatasets.length; i++) {
            const pkmnDataset = this.plainPkmnDatasets[i];
            differences.push(this.createPkmnExclusives(pkmnDataset, similarities));
        }

        return differences;
    }

    private createPkmnExclusives(pkmnDataset: TunedPkmnJSON, similarities: PkmnGenSimilarities): PkmnGameExclusives {
        const pkmnGameExclusives = {
            game: pkmnDataset.game,
            exists: pkmnDataset.exists,
            name: pkmnDataset.name,
            eggGroup1: pkmnDataset.eggGroup1,
            eggGroup2: pkmnDataset.eggGroup2,
            gender: pkmnDataset.gender,
            lowestEvo: pkmnDataset.lowestEvo,
            evolutions: pkmnDataset.evolutions,
            unpairable: pkmnDataset.unpairable,
            unbreedable: pkmnDataset.unbreedable,
            directLearnsets: this.getListDifference(pkmnDataset.directLearnsets, similarities.directLearnsets),
            breedingLearnsets: this.getListDifference(pkmnDataset.breedingLearnsets, similarities.breedingLearnsets),
            eventLearnsets: this.getListDifference(pkmnDataset.eventLearnsets, similarities.eventLearnsets),
            oldGenLearnsets: this.getListDifference(pkmnDataset.oldGenLearnsets, similarities.oldGenLearnsets),
        };

        if (pkmnGameExclusives.exists) {
            (pkmnGameExclusives.directLearnsets = this.getListDifference(
                pkmnDataset.directLearnsets,
                similarities.directLearnsets
            )),
                (pkmnGameExclusives.breedingLearnsets = this.getListDifference(
                    pkmnDataset.breedingLearnsets,
                    similarities.breedingLearnsets
                )),
                (pkmnGameExclusives.eventLearnsets = this.getListDifference(
                    pkmnDataset.eventLearnsets,
                    similarities.eventLearnsets
                )),
                (pkmnGameExclusives.oldGenLearnsets = this.getListDifference(
                    pkmnDataset.oldGenLearnsets,
                    similarities.oldGenLearnsets
                ));
        }

        return pkmnGameExclusives;
    }

    private getListDifference(source: string[], blocker: string[]): string[] {
        const difference: string[] = [];
        for (const item of source) {
            if (!blocker.includes(item)) {
                difference.push(item);
            }
        }

        return difference;
    }
}
