import { PkmnGender, LearnsetType } from './types';

export class PkmnObj {
    name: string;
    id: string;
    eggGroup1: string;
    eggGroup2: string;
    gender: PkmnGender;
    lowestEvolution = '';

    //whether this pkmn cannot get a child with another pkmn
    unpairable = false;
    //whether this pkmn cannot be born in the pension/daycare/whatsoever
    unbreedable = false;

    directLearnsets: string[] = [];
    breedingLearnsets: string[] = [];
    eventLearnsets: string[] = [];
    oldGenLearnsets: string[] = [];

    constructor(
        name: string,
        id: string,
        eggGroup1: string,
        eggGroup2 = '',
        gender: PkmnGender
    ) {
        this.name = name.trim();
        this.id = id.trim();

        this.eggGroup1 = eggGroup1.trim();
        this.eggGroup2 = eggGroup2.trim();
        this.gender = gender;
    }

    setLowestEvolution(lowestEvoName: string) {
        this.lowestEvolution = lowestEvoName;
    }

    addLearnset(type: LearnsetType, move: string) {
        //default value to prevent errors
        let learnsetType: keyof PkmnObj = 'directLearnsets';
        switch (type) {
            case 'Level':
            case 'TMTP':
            case 'TMVM':
            case 'Lehrer':
                learnsetType = 'directLearnsets';
                break;
            case 'Zucht':
                learnsetType = 'breedingLearnsets';
                break;
            case 'Event':
                learnsetType = 'eventLearnsets';
                break;
        }

        const learnsetArr = this[learnsetType] as string[];

        if (learnsetArr.includes(move)) {
            return;
        }

        learnsetArr.push(move);
    }
}
