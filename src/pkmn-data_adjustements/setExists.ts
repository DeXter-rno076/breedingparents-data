import { AdjustedPkmnDataset } from '../types';
import { doToAllPkmnDataFiles } from './utils';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';

export function setExists() {
    doToAllPkmnDataFiles(replaceOldMoveNamesOfDataset);
}

function replaceOldMoveNamesOfDataset(fileContent: AdjustedPkmnDataset) {
    for (const pkmn of Object.values(fileContent)) {
        setExistsForPkmn(pkmn);
    }
}

function setExistsForPkmn(pkmn: AdjustedPkmnJSON) {
    if (pkmnDoesntExistInThisGen(pkmn)) {
        pkmn.exists = false;
    } else {
        pkmn.exists = true;
    }
}

function pkmnDoesntExistInThisGen(pkmn: AdjustedPkmnJSON): boolean {
    return pkmn.directLearnsets.length + pkmn.breedingLearnsets.length + pkmn.eventLearnsets.length === 0;
}
