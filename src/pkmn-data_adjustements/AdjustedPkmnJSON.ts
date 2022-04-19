import { InitialPkmnJSON } from '../initial_pkmn-data/InitialPkmnJSON';

export interface AdjustedPkmnJSON extends InitialPkmnJSON {
    oldGenLearnsets?: string[];
    unbreedable?: boolean;
    unpairable?: boolean;
    lowestEvo?: string;
    evolutions?: string[];
    exists?: boolean;
}
