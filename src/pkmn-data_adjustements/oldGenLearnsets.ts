import Logger from '../Logger';
import fs from 'fs';
import { doToAllPlainPkmnDataFiles } from './utils';
import { AdjustedPkmnDataset } from '../types';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { OLDEST_GEN } from '../constants';

const oldGenLearnsets = new Map<string, Map<number, string[]>>();

const babys = JSON.parse(fs.readFileSync('data/in/babys.json', { encoding: 'utf-8' })) as string[];

/* 
todo create banned moves category for bdsp in the wiki and block 
all gen8 moves in the interception of banned moves from swsh and bdsp
*/

export default function addOldGenLearnsets() {
    Logger.initLogs('oldGenLearnsets');
    Logger.statusLog('adding old gen learnsets');

    doToAllPlainPkmnDataFiles(addLearnsetsForFile);
}

function addLearnsetsForFile(pkmnDataSet: AdjustedPkmnDataset) {
    if (pkmnDataSet['Pikachu'] === undefined) {
        Logger.elog('oldGenLearnsets: addLearnsetsForFile: adjusted data set doesnt have Pikachu');
        return;
    }
    const gen = GamesPerGenUtils.gameToGenNumber(pkmnDataSet['Pikachu'].game);
    for (let pkmnName of Object.keys(pkmnDataSet)) {
        pkmnDataSet[pkmnName].oldGenLearnsets = [];
        if (!pkmnDataSet[pkmnName].exists) {
            continue;
        }
        if (
            pkmnDataSet[pkmnName].unpairable &&
            pkmnDataSet[pkmnName].lowestEvo === pkmnName &&
            !babys.includes(pkmnName)
        ) {
            //dont skip: babys, pkmn with lower evos (like Nidoqueen)
            //pkmn is unpairable => oldGenLearnsets are irrelevant
            continue;
        }
        if (!oldGenLearnsets.has(pkmnName)) {
            // Logger.statusLog(`${pkmnName} has no old learnsets yet`);
            addNewPkmnToLearnsetMap(pkmnName, pkmnDataSet[pkmnName], gen);
            continue;
        }
        addOldGenLearnsetsToPkmn(pkmnName, pkmnDataSet[pkmnName], gen);
        addPkmnLearnsetsToOldGenLearnsets(pkmnName, pkmnDataSet[pkmnName], gen);
    }
}

function addNewPkmnToLearnsetMap(pkmnName: string, pkmnObj: AdjustedPkmnJSON, gen: number) {
    /* Logger.statusLog(`adding ${pkmnName} with its direct learnsets 
        to oldGenLearnsets map`); */
    const directLearnsets = pkmnObj.directLearnsets;
    const pkmnGenMap = new Map<number, string[]>();
    pkmnGenMap.set(gen, directLearnsets);
    oldGenLearnsets.set(pkmnName, pkmnGenMap);
}

function addOldGenLearnsetsToPkmn(pkmnName: string, pkmnObj: AdjustedPkmnJSON, gen: number) {
    // Logger.statusLog(`adding old gen learnsets to pkmn ${pkmnName}`);
    const pkmnDirectLearnsets = pkmnObj.directLearnsets;
    const pkmnOldGenLearnsets = getPkmnOldgenLearnsets(pkmnName, gen);
    if (pkmnOldGenLearnsets === undefined) {
        Logger.elog(`addOldGenLearnsetsToPkmn: no old gen learnsets for ${pkmnName} found,
            this should result in a different program path`);
        return;
    }

    for (let oldMove of pkmnOldGenLearnsets) {
        if (!pkmnDirectLearnsets.includes(oldMove)) {
            // Logger.statusLog(`found move ${oldMove}, adding to oldGenLearnsets`);
            if (!pkmnObj.oldGenLearnsets.includes(oldMove)) {
                pkmnObj.oldGenLearnsets.push(oldMove);
            }
        }
    }
}

function getPkmnOldgenLearnsets(pkmnName: string, gen: number): string[] {
    let learnsets: string[] = [];
    const pkmnLearnsets = oldGenLearnsets.get(pkmnName);
    if (pkmnLearnsets === undefined) {
        Logger.elog(
            'oldGenLearnsets: getPkmnOldgenLearnsets: ' +
                pkmnName +
                ' didnt exist in map even though this should have been caught earlier'
        );
        return [];
    }
    for (let i = OLDEST_GEN; i < gen; i++) {
        const genLearnsets = pkmnLearnsets.get(i);
        if (genLearnsets === undefined) {
            Logger.wlog('oldGenLearnsets: getPkmnOldGenlearnsets: ' + pkmnName + ' doesnt have learnsets for gen ' + i);
            continue;
        }
        learnsets = learnsets.concat(genLearnsets);
    }

    return learnsets;
}

function addPkmnLearnsetsToOldGenLearnsets(pkmnName: string, pkmnObj: AdjustedPkmnJSON, gen: number) {
    //Logger.statusLog(`adding direct learnsets of ${pkmnName} to old gen learnsets`);
    const pkmnOldGenLearnsets = oldGenLearnsets.get(pkmnName);
    if (!pkmnOldGenLearnsets.has(gen)) {
        pkmnOldGenLearnsets.set(gen, []);
    }
    const pkmnDirectLearnsets = pkmnObj.directLearnsets;
    const pkmnGenOldGenLearnsets = pkmnOldGenLearnsets.get(gen);
    if (pkmnGenOldGenLearnsets === undefined) {
        Logger.elog(`addPkmnLearnsetsToOldGenLearnsets: no old gen learnsets for ${pkmnName} found,
            this should result in a different program path`);
        return;
    }
    for (let newMove of pkmnDirectLearnsets) {
        if (!pkmnGenOldGenLearnsets.includes(newMove)) {
            // Logger.statusLog(`move ${newMove} found, adding to old gen learnsets array`);
            pkmnGenOldGenLearnsets.push(newMove);
        }
    }
}
