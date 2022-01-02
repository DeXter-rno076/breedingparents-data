import { NEWEST_GEN, OLDEST_GEN } from '../constants';
import Logger from '../LogHandler';
import { PkmnObj } from '../PkmnObj';
import { getJSONPkmnData, savePkmnData } from '../utils';
import fs from 'fs';

const oldGenLearnsets = new Map<string, string[]>();

const babys = JSON.parse(fs.readFileSync('data/babys.json', {encoding: 'utf-8'})) as string[];

/* 
todo create banned moves category for bdsp in the wiki and block 
all gen8 moves in the interception of banned moves from swsh and bdsp*/

export default function addOldGenLearnsets() {
    Logger.initLogs('oldGenLearnsets');
    Logger.statusLog('adding old gen learnsets');

    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        Logger.statusLog(`working through gen ${gen}`);
        const fileName = `pkmnDataGen${gen}.json`;
        addLearnsetsForFile(fileName);
    }
}

function addLearnsetsForFile(fileName: string) {
    Logger.statusLog(`adding old gen learnsets of file ${fileName}`);
    const fileData = getJSONPkmnData(fileName);
    for (let pkmnName of Object.keys(fileData)) {
        if (
            fileData[pkmnName].unpairable &&
            fileData[pkmnName].lowestEvolution === pkmnName &&
            !babys.includes(pkmnName)
        ) {
            //dont skip: babys, pkmn with lower evos (like Nidoqueen)
            //pkmn is unpairable => oldGenLearnsets are irrelevant
            continue;
        }
        if (!oldGenLearnsets.has(pkmnName)) {
            //Logger.statusLog(`${pkmnName} has no old learnsets yet`);
            addNewPkmnToLearnsetMap(pkmnName, fileData[pkmnName]);
            continue;
        }
        addOldGenLearnsetsToPkmn(pkmnName, fileData[pkmnName]);
        addPkmnLearnsetsToOldGenLearnsets(pkmnName, fileData[pkmnName]);
    }

    savePkmnData(fileName, fileData);
}

function addNewPkmnToLearnsetMap(pkmnName: string, pkmnObj: PkmnObj) {
    /* Logger.statusLog(`adding ${pkmnName} with its direct learnsets 
        to oldGenLearnsets map`); */
    const directLearnsets = pkmnObj.directLearnsets;
    oldGenLearnsets.set(pkmnName, directLearnsets);
}

function addOldGenLearnsetsToPkmn(pkmnName: string, pkmnObj: PkmnObj) {
    //Logger.statusLog(`adding old gen learnsets to pkmn ${pkmnName}`);
    const pkmnDirectLearnsets = pkmnObj.directLearnsets;
    const pkmnOldGenLearnsets = oldGenLearnsets.get(pkmnName);
    if (pkmnOldGenLearnsets === undefined) {
        Logger.elog(`addOldGenLearnsetsToPkmn: no old gen learnsets for ${pkmnName} found,
            this should result in a different program path`);
        return;
    }
    for (let oldMove of pkmnOldGenLearnsets) {
        if (!pkmnDirectLearnsets.includes(oldMove)) {
            //Logger.statusLog(`found move ${oldMove}, adding to oldGenLearnsets`);
            if (!pkmnObj.oldGenLearnsets.includes(oldMove)) {
                pkmnObj.oldGenLearnsets.push(oldMove);
            }
        }
    }
}

function addPkmnLearnsetsToOldGenLearnsets(pkmnName: string, pkmnObj: PkmnObj) {
    //Logger.statusLog(`adding direct learnsets of ${pkmnName} to old gen learnsets`);
    const pkmnDirectLearnsets = pkmnObj.directLearnsets;
    const currentOldGenLearnsets = oldGenLearnsets.get(pkmnName);
    if (currentOldGenLearnsets === undefined) {
        Logger.elog(`addPkmnLearnsetsToOldGenLearnsets: no old gen learnsets for ${pkmnName} found,
            this should result in a different program path`);
        return;
    }
    for (let newMove of pkmnDirectLearnsets) {
        if (!currentOldGenLearnsets.includes(newMove)) {
            //Logger.statusLog(`move ${newMove} found, adding to old gen learnsets array`);
            currentOldGenLearnsets.push(newMove);
        }
    }
}
