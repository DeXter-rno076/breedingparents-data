import { PkmnGameExclusives } from '../diffs_creation/PkmnGameExclusives';
import { PkmnGenSimilarities } from '../diffs_creation/PkmnGenSimilarities';
import Logger from '../Logger';
import { doToAllSplitDataFiles } from './utils';

export function namesToLowerCase() {
	doToAllSplitDataFiles(changeAllNamesToLowerCaseForPkmn);
}

function changeAllNamesToLowerCaseForPkmn(fileContent: {[key: string]: PkmnGameExclusives | PkmnGenSimilarities | string}) {
    for (const [pkmnName, pkmnData] of Object.entries(fileContent)) {
		if (typeof pkmnData === 'string') {
			continue;
		}
        const lowerCaseName = pkmnName.toLowerCase();
        fileContent[lowerCaseName] = changeAllPkmnNamesToLowerCaseForPkmn(pkmnData);
		const t = fileContent[lowerCaseName];
		if (typeof t === 'string') {
			Logger.elog('data of key ' + lowerCaseName + ' somehow got type string');
			continue;
		}
		fileContent[lowerCaseName] = changeAllMoveNamesToLowerCaseForPkmn(t);
        delete fileContent[pkmnName];
    }
}

//todo parameter typ any is unclean af
function changeAllPkmnNamesToLowerCaseForPkmn(pkmn: any): PkmnGameExclusives | PkmnGenSimilarities {
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

function changeAllMoveNamesToLowerCaseForPkmn(pkmn: PkmnGameExclusives | PkmnGenSimilarities): PkmnGameExclusives | PkmnGenSimilarities {
	pkmn.directLearnsets = learnsetToLowerCase(pkmn.directLearnsets);
	pkmn.breedingLearnsets = learnsetToLowerCase(pkmn.breedingLearnsets);
	pkmn.eventLearnsets = learnsetToLowerCase(pkmn.eventLearnsets);
	pkmn.oldGenLearnsets = learnsetToLowerCase(pkmn.oldGenLearnsets);
	return pkmn;
}

function learnsetToLowerCase (learnset: string[]): string[] {
	return learnset.map(item => item.toLowerCase());
}