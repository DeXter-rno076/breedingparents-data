import { InitialPkmnJSON } from '../initial_pkmn-data/InitialPkmnJSON';

export interface TunedPkmnJSON extends InitialPkmnJSON {
    oldGenLearnsets: string[];
    unbreedable: boolean;
    unpairable: boolean;
    lowestEvo: string;
    evolutions: string[];
    exists: boolean;
	correctlyWrittenName: string;
	subpageLinkName: string;
}
