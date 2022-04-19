import { AdjustedPkmnDataset } from '../types';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';
import { doToAllPkmnDataFiles } from './utils';

export function pkmnNamesToLowerCase() {
    doToAllPkmnDataFiles(changeAllPkmnNamesToLowerCase);
}

function changeAllPkmnNamesToLowerCase(fileContent: AdjustedPkmnDataset) {
    for (const [pkmnName, pkmnData] of Object.entries(fileContent)) {
        const lowerCaseName = pkmnName.toLowerCase();
        fileContent[lowerCaseName] = changeAllPkmnNamesToLowerCaseForPkmn(pkmnData);
        delete fileContent[pkmnName];
    }
}

function changeAllPkmnNamesToLowerCaseForPkmn(pkmn: AdjustedPkmnJSON): AdjustedPkmnJSON {
    //lowestEvo, evolutions
    if (pkmn.lowestEvo !== undefined) {
        pkmn.lowestEvo = pkmn.lowestEvo.toLowerCase();
    }
    if (pkmn.evolutions !== undefined) {
        pkmn.evolutions = pkmn.evolutions.map((item) => item.toLowerCase());
    }

    pkmn.name = pkmn.name.toLowerCase();

    return pkmn;
}
