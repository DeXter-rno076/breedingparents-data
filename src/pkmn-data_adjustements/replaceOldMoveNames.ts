import fs from 'fs';
import Logger from '../Logger';
import { MoveRenamingInfo, AdjustedPkmnDataset } from '../types';
import { doToAllPlainPkmnDataFiles } from './utils';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';

//todo
const moveRenameData: MoveRenamingInfo[] = JSON.parse(
    fs.readFileSync('data/in/renamedMovesData.json', { encoding: 'utf-8' })
);

let oldMoveNames: string[] = [];

export function replaceOldMoveNames() {
    Logger.initLogs('replaceOldMoveNames');

    initOldMoveNames();

    doToAllPlainPkmnDataFiles(replaceOldMoveNamesOfDataset);
}

function replaceOldMoveNamesOfDataset(fileContent: AdjustedPkmnDataset) {
    for (const pkmn of Object.values(fileContent)) {
        replaceOldMoveNamesOfPkmn(pkmn);
    }
}

function replaceOldMoveNamesOfPkmn(pkmnObj: AdjustedPkmnJSON) {
    /*oldGenLearnsets are excluded because they are added after this script
    => old gen learnsets already use the current move names from the start*/
    const learnsetLists = [pkmnObj.directLearnsets, pkmnObj.breedingLearnsets, pkmnObj.eventLearnsets];

    for (const learnsetList of learnsetLists) {
        for (let i = 0; i < learnsetList.length; i++) {
            const moveName = learnsetList[i];
            if (oldMoveNames.includes(moveName)) {
                const newName = getCurrentMoveName(moveName);
                if (newName === null) {
                    Logger.elog(
                        "replaceOldMoveNamesOfPkmn: couldn't find " + 'current name of old move name: ' + moveName
                    );
                    continue;
                }
                learnsetList[i] = newName;
            }
        }
    }
}

function initOldMoveNames() {
    for (const renamingInfo of moveRenameData) {
        oldMoveNames = oldMoveNames.concat(renamingInfo.oldNames);
    }
}

function getCurrentMoveName(oldName: string): string | null {
    let currentName = '';
    for (const renamingInfo of moveRenameData) {
        if (renamingInfo.oldNames.includes(oldName)) {
            currentName = renamingInfo.currentName;
        }
    }

    if (currentName === '') {
        return null;
    }

    return currentName;
}
