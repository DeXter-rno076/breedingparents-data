import { Game, PkmnGender } from '../types';

export interface PkmnInitializer {
    game: Game;
    name: string;
    id: string;
    gender: PkmnGender;
    eggGroup1: string;
    eggGroup2: string;
}
