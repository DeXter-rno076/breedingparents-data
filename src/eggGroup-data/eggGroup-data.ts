import { NEWEST_GEN, OLDEST_GEN } from '../constants';
import { FileLoader } from '../file_managing/FileLoader';
import { FileSaver } from '../file_managing/FileSaver';
import { GeneralUtils } from '../GeneralUtils';
import Logger from '../Logger';
import { TunedPkmnJSON } from '../pkmn-data_adjustements/TunedPkmnJSON';
import { PlainPkmnDataset } from '../types';

export default function createEggGroupData() {
    Logger.initLogs('eggGroup-data');
    Logger.statusLog(`creating egg group data files`);
    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        Logger.statusLog(`creating gen ${gen} file`);

        const pkmnDatasetFileNames = FileLoader.getPlainGenPkmnDatasetNameList(gen);

        for (const pkmnDatasetFileName of pkmnDatasetFileNames) {
            const pkmnDataset = JSON.parse(FileLoader.getPlainGenPkmnDataSetByFileName(pkmnDatasetFileName, gen));
            const eggGroups = createGameEggGroupDataset(pkmnDataset);
            if (pkmnDataset['pikachu'] === undefined) {
                Logger.elog('createEggGroupData: pikachu is not set in gen ' + gen + ' file ' + pkmnDatasetFileName);
                continue;
            }
            const game = pkmnDataset['pikachu'].game;
            const eggGroupsObj = GeneralUtils.mapToObject(eggGroups);
            const eggGroupsText = JSON.stringify(eggGroupsObj);
            FileSaver.saveEggGroupDataset(game, eggGroupsText);
        }
    }
    Logger.statusLog(`finished createing egg group data files`);
}

function createGameEggGroupDataset(pkmnDataset: PlainPkmnDataset): Map<string, string[]> {
    const eggGroups = new Map<string, string[]>();
    for (const [pkmnName, pkmnData] of Object.entries(pkmnDataset)) {
        if (pkmnData.unpairable || !pkmnData.exists) {
            continue;
        }
        const eggGroupNames = [pkmnData.eggGroup1, pkmnData.eggGroup2];
        for (const eggGroupName of eggGroupNames) {
            if (eggGroupName === '') {
                continue;
            }
            if (!eggGroups.has(eggGroupName)) {
                eggGroups.set(eggGroupName, []);
            }
            insertSorted(eggGroups.get(eggGroupName), pkmnData, pkmnDataset);
        }
    }

    return eggGroups;
}

function insertSorted(eggGroupArr: string[], newEggGroupMember: TunedPkmnJSON, pkmnDataset: PlainPkmnDataset) {
    /* Logger.statusLog(
        `inserting ${newEggGroupMember.name} sorted into egg group array`
    ); */
    let targetIndex = eggGroupArr.length;

    for (let i = 0; i < eggGroupArr.length; i++) {
        const curLookedAtPkmnName = eggGroupArr[i];
        const curLookedAtPkmnId = pkmnDataset[curLookedAtPkmnName].id;

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
