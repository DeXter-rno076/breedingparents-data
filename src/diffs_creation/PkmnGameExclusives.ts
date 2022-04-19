import { Game, PkmnGender } from '../types';

export interface PkmnGameExclusives {
    game: Game;
    exists: boolean;

    name: string;
    eggGroup1: string;
    eggGroup2: string;
    gender: PkmnGender;
    lowestEvo: string;
    evolutions: string[];
    unpairable: boolean;
    unbreedable: boolean;

    directLearnsets: string[];
    breedingLearnsets: string[];
    eventLearnsets: string[];
    oldGenLearnsets: string[];
}
