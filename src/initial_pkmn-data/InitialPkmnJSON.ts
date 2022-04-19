import { Game, PkmnGender } from '../types';

export interface InitialPkmnJSON {
    game: Game;
    name: string;
    id: string;
    gender: PkmnGender;
    eggGroup1: string;
    eggGroup2: string;
    directLearnsets: string[];
    breedingLearnsets: string[];
    eventLearnsets: string[];
}
