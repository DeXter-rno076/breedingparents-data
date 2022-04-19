import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import { LearnsetType, Game, PkmnGender } from '../types';
import { InitialPkmnJSON } from './InitialPkmnJSON';
import { LearnsetTable } from './LearnsetTable';
import { PkmnInitializer } from './PkmnInitializer';

export class Pkmn {
    private readonly name: string;
    private readonly id: string;
    private readonly game: Game;
    private readonly eggGroup1: string;
    private readonly eggGroup2: string;
    private readonly gender: PkmnGender;
    private readonly directLearnsets: string[];
    private readonly breedingLearnsets: string[];
    private readonly eventLearnsets: string[];

    public constructor(initData: PkmnInitializer) {
        this.name = initData.name;
        this.id = initData.id;
        this.game = initData.game;
        this.eggGroup1 = initData.eggGroup1;
        this.eggGroup2 = initData.eggGroup2;
        this.gender = initData.gender;

        this.directLearnsets = [];
        this.breedingLearnsets = [];
        this.eventLearnsets = [];
    }

    /**
     * @throws UnexpectedParamValueException
     */
    public addLearnset(learnsetTable: LearnsetTable) {
        const learnsetType = learnsetTable.getLearnsetType();
        const learnsetList = this.getLearnsetListByType(learnsetType);
        const moveNameList = learnsetTable.getMoveNames();

        this.addMovesToLearnsetList(learnsetList, moveNameList);
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private getLearnsetListByType(learnsetType: LearnsetType): string[] {
        switch (learnsetType) {
            case 'Level':
            case 'TMTP':
            case 'TMVM':
            case 'Lehrer':
            case 'Meisterung':
                return this.directLearnsets;
            case 'Zucht':
                return this.breedingLearnsets;
            case 'Event':
                return this.eventLearnsets;
            case 'Kampfexklusiv':
                throw new InvalidArgumentException('learnsetType', 'valid learnsetType');
        }
    }

    private addMovesToLearnsetList(learnsetList: string[], moveNameList: string[]) {
        for (const moveName of moveNameList) {
            this.addMoveToLearnsetList(learnsetList, moveName);
        }
    }

    private addMoveToLearnsetList(learnsetList: string[], moveName: string) {
        if (!learnsetList.includes(moveName)) {
            learnsetList.push(moveName);
        }
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public getGame(): Game {
        return this.game;
    }

    public toDatasetJSON(): InitialPkmnJSON {
        const dataSetJSONRepresentation: InitialPkmnJSON = {
            game: this.game,
            name: this.name,
            id: this.id,
            gender: this.gender,
            eggGroup1: this.eggGroup1,
            eggGroup2: this.eggGroup2,
            directLearnsets: this.directLearnsets,
            breedingLearnsets: this.breedingLearnsets,
            eventLearnsets: this.eventLearnsets,
        };

        return dataSetJSONRepresentation;
    }
}
