import fs from 'fs';
import { NON_PERMANENT_PKMN_FORMS } from '../constants';
import Logger from '../Logger';
import { PkmnEvolutionLink, AdjustedPkmnDataset } from '../types';
import { doToAllPkmnDataFiles } from './utils';

//todo
const evoData = JSON.parse(fs.readFileSync('data/in/evos.json', { encoding: 'utf-8' })) as {
    [key: string]: PkmnEvolutionLink;
};

export default function addLowestEvolution() {
    Logger.initLogs('addLowestEvolution');
    Logger.statusLog('adding lowest evolution to every pkmn');

    doToAllPkmnDataFiles(setLowestEvolutions);

    Logger.statusLog('finished adding lowest evos');
}

function setLowestEvolutions(pkmnData: AdjustedPkmnDataset) {
    for (let pkmnName of Object.keys(pkmnData)) {
        const lowestEvo = findLowestEvo(pkmnName);
        pkmnData[pkmnName].lowestEvo = lowestEvo;
    }
}

/**
 * finds lowest evolution of pkmnName and returns it
 * if pkmnName is a non permanent form, it returns an empty string
 * if pkmnName is already the lowest evolution, it returns an empty string
 */
function findLowestEvo(pkmnName: string): string {
    if (NON_PERMANENT_PKMN_FORMS.includes(pkmnName)) {
        return pkmnName;
    }
    //Logger.statusLog(`finding lowest evo for ${pkmnName}`);
    let lookedAtPkmn = evoData[pkmnName];
    if (lookedAtPkmn === undefined) {
        Logger.elog(`couldnt find evo data for ${pkmnName}`);
        return pkmnName;
    }
    while (lookedAtPkmn.pre !== '') {
        lookedAtPkmn = evoData[lookedAtPkmn.pre];
        if (lookedAtPkmn === undefined) {
            Logger.elog(`couldnt find evo data for ${pkmnName}`);
            return pkmnName;
        }
    }

    //Logger.statusLog(`found ${lookedAtPkmn.name}`);
    return lookedAtPkmn.name;
}
