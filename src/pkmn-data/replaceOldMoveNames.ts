import fs from 'fs';
import Logger from '../LogHandler';
import { PkmnObj } from '../PkmnObj';
import { MoveRenamingInfo } from '../types';
import { getJSONPkmnData, getPkmnDataFiles, savePkmnData } from '../utils';

const moveRenameData: MoveRenamingInfo[] = JSON.parse(
    fs.readFileSync('data/renamedMovesData.json', { encoding: 'utf-8' })
);

let oldMoveNames: string[] = [];

export function replaceOldMoveNames() {
    Logger.initLogs('replaceOldMoveNames');
    initOldMoveNames();
    const pkmnDataFiles = getPkmnDataFiles();

    for (const fileName of pkmnDataFiles) {
        const jsonData = getJSONPkmnData(fileName);

        for (const pkmnName of Object.keys(jsonData)) {
            replaceOldMoveNamesOfPkmn(jsonData[pkmnName]);
        }
        savePkmnData(fileName, jsonData);
    }
}

function replaceOldMoveNamesOfPkmn(pkmnObj: PkmnObj) {
    const learnsetLists = [
        pkmnObj.directLearnsets,
        pkmnObj.breedingLearnsets,
        pkmnObj.eventLearnsets,
        pkmnObj.oldGenLearnsets,
    ];

    for (const learnsetList of learnsetLists) {
        for (let i = 0; i < learnsetList.length; i++) {
            const moveName = learnsetList[i];
            if (oldMoveNames.includes(moveName)) {
                const newName = getCurrentMoveName(moveName);
                if (newName === null) {
                    Logger.elog(
                        "replaceOldMoveNamesOfPkmn: couldn't find " +
                            'current name of old move name: ' +
                            moveName
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
