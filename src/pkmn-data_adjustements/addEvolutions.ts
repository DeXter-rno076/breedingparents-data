import Logger from '../Logger';
import { AdjustedPkmnDataset, PkmnEvolutionLink } from '../types';
import fs from 'fs';
import { doToAllPlainPkmnDataFiles } from './utils';
import { FluidFormsUtils } from '../external_data_utils/FluidFormsUtils';

const evoData = JSON.parse(fs.readFileSync('data/in/evos.json', { encoding: 'utf-8' })) as {
    [key: string]: PkmnEvolutionLink;
};

const pkmnEvolutions = new Map<string, string[]>();

export function addEvolutions() {
    Logger.initLogs('handleGenderSpecialcases');
    Logger.statusLog('adding evolutions lists to all pkmn');

    initPkmnEvolutionsMap();

    doToAllPlainPkmnDataFiles(addEvosToFilePkmn);

    Logger.statusLog('finished adding evolutions lists to pkmn');
}

function initPkmnEvolutionsMap() {
    for (const [pkmnName, pkmnEvoData] of Object.entries(evoData)) {
        initMapEntryIfNeeded(pkmnName);

        let evos = [pkmnName];
        let pre = pkmnEvoData.pre;
        while (pre !== '') {
            initMapEntryIfNeeded(pre);

            const preEvos = pkmnEvolutions.get(pre) as string[];

            for (const evo of evos) {
                if (!preEvos.includes(evo)) {
                    preEvos.push(evo);
                }
            }

            pre = evoData[pre].pre;
        }
    }
}

function initMapEntryIfNeeded(pkmnName: string) {
    if (!pkmnEvolutions.has(pkmnName)) {
        pkmnEvolutions.set(pkmnName, []);
    }
}

function addEvosToFilePkmn(pkmnJSONData: AdjustedPkmnDataset) {
    for (const [pkmnName, pkmnData] of Object.entries(pkmnJSONData)) {
        let normalEvoFormName = '';
        if (FluidFormsUtils.isFluidform(pkmnName)) {
            normalEvoFormName = FluidFormsUtils.getNormalformFromFluidForm(pkmnName);
        } else {
            normalEvoFormName = pkmnName;
        }
        if (!pkmnEvolutions.has(normalEvoFormName)) {
            Logger.elog('addEvosToFilePkmn: pkmn ' + pkmnName + ' not in evo data map');
            continue;
        }
        const evos = pkmnEvolutions.get(pkmnName) as string[];
        pkmnData.evolutions = evos;
    }
}
