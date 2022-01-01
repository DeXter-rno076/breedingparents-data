import fs from 'fs';
import { PkmnObj } from '../PkmnObj';
import { DATA_OUTPUT_DIR, NEWEST_GEN, OLDEST_GEN } from '../constants';
import Logger from '../LogHandler';

let GEN = -1;
let pkmnData: { [key: string]: PkmnObj };
const eggGroupData = new Map<string, string[]>();

export default function createEggGroupData() {
    Logger.initLogs('eggGroup-data');
    Logger.statusLog(`creating egg group data files`);
    for (let i = OLDEST_GEN; i <= NEWEST_GEN; i++) {
        Logger.statusLog(`creating gen ${i} file`);
        //yep, that's quite unclean, but originally this was built for one gen at a time
        //and I don't have unlimited time so take it or leave it
        GEN = i;

        eggGroupData.clear();

        pkmnData = JSON.parse(
            fs.readFileSync(DATA_OUTPUT_DIR + '/pkmnDataGen' + GEN + '.json', {
                encoding: 'utf-8',
            })
        );

        createGenEggGroupDataSet();
        Logger.statusLog(`finished gen ${i} file`);
    }
    Logger.statusLog(`finished createing egg group data files`);
}

function createGenEggGroupDataSet() {
    Logger.statusLog(`extracting egg group data`);
    for (let pkmn in pkmnData) {
        //Logger.statusLog(`extracting egg groups of ${pkmn}`);
        const pkmnObj = pkmnData[pkmn];
        const eggGroup1 = pkmnObj.eggGroup1 || null;
        const eggGroup2 = pkmnObj.eggGroup2 || null;
        const isUnpairable = pkmnObj.unpairable;

        if (eggGroup1 === null) {
            Logger.elog(
                `createGenEggGroupDataSet: pkmn has no egg groups: ${pkmn}`
            );
            continue;
        }
        if (isUnpairable) {
            //Logger.statusLog(`skipping ${pkmn} because it\'s unpairable`);
            //egg group lists are only relevant for finding pot. parents
            //unpairables can't be parents
            continue;
        }

        handleEggGroup(eggGroup1, pkmnObj);
        handleEggGroup(eggGroup2, pkmnObj);
    }

    Logger.statusLog(`saving egg group data set`);
    fs.writeFileSync(
        DATA_OUTPUT_DIR + `/eggGroupDataGen${GEN}.json`,
        JSON.stringify(Object.fromEntries(eggGroupData))
    );
}

function handleEggGroup(eggGroup: string | null, pkmn: PkmnObj) {
    //Logger.statusLog(`adding ${pkmn.name} to egg group lists`);
    if (eggGroup === null) {
        /* Logger.statusLog(
            `skipping because ${pkmn.name} doesn\'t have selected egg group`
        ); */
        return;
    }

    if (!eggGroupData.has(eggGroup)) {
        //Logger.statusLog(`adding new egg group ${eggGroup}`);
        eggGroupData.set(eggGroup, []);
    }

    const targetedEggGroupArr = eggGroupData.get(eggGroup) as string[];
    insertSorted(targetedEggGroupArr, pkmn);
}

function insertSorted(eggGroupArr: string[], newEggGroupMember: PkmnObj) {
    /* Logger.statusLog(
        `inserting ${newEggGroupMember.name} sorted into egg group array`
    ); */
    let targetIndex = eggGroupArr.length;

    for (let i = 0; i < eggGroupArr.length; i++) {
        const curLookedAtPkmnName = eggGroupArr[i];
        const curLookedAtPkmnId = pkmnData[curLookedAtPkmnName].id;

        if (newEggGroupMember.id < curLookedAtPkmnId) {
            //Logger.statusLog(`found suiting index ${i}`);
            targetIndex = i;
            break;
        }
    }

    /* Logger.statusLog(
        `adding ${newEggGroupMember} to egg group array at position ${targetIndex}`
    ); */
    eggGroupArr.splice(targetIndex, 0, newEggGroupMember.name);
}
