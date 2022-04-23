import { AdjustedPkmnDataset } from '../types';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';
import { doToAllPkmnDataFiles } from './utils';

export function namesToLowerCase() {
	doToAllPkmnDataFiles(changeAllNamesToLowerCase);
}

function changeAllNamesToLowerCase(fileContent: AdjustedPkmnDataset) {
    for (const [pkmnName, pkmnData] of Object.entries(fileContent)) {
        const lowerCaseName = pkmnName.toLowerCase();
        fileContent[lowerCaseName] = changeAllPkmnNamesToLowerCaseForPkmn(pkmnData);
		fileContent[lowerCaseName] = changeAllMoveNamesToLowerCaseForPkmn(fileContent[lowerCaseName]);
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

function changeAllMoveNamesToLowerCaseForPkmn(pkmn: AdjustedPkmnJSON): AdjustedPkmnJSON {
	pkmn.directLearnsets = learnsetToLowerCase(pkmn.directLearnsets);
	pkmn.breedingLearnsets = learnsetToLowerCase(pkmn.breedingLearnsets);
	pkmn.eventLearnsets = learnsetToLowerCase(pkmn.eventLearnsets);
	pkmn.oldGenLearnsets = learnsetToLowerCase(pkmn.oldGenLearnsets);
	return pkmn;
}

function learnsetToLowerCase (learnset: string[]): string[] {
	return learnset.map(item => item.toLowerCase());
}