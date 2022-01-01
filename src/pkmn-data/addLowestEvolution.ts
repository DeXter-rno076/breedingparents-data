import fs from 'fs';
import { NON_PERMANENT_PKMN_FORMS } from '../constants';
import Logger from '../LogHandler';
import { EvolutionsData, PkmnDataJSONObj } from '../types';
import { getJSONPkmnData, getPkmnDataFiles, savePkmnData } from '../utils';

const evoData = JSON.parse(
    fs.readFileSync('data/evos.json', { encoding: 'utf-8' })
) as { [key: string]: EvolutionsData };

export default function addLowestEvolution() {
    Logger.initLogs('addLowestEvolution');
    Logger.statusLog('adding lowest evolution to every pkmn');

    const pkmnDataFiles = getPkmnDataFiles();

    for (let fileName of pkmnDataFiles) {
        Logger.statusLog(`working through ${fileName}`);
        const pkmnData = getJSONPkmnData(fileName);
        setLowestEvolutions(pkmnData);
        savePkmnData(fileName, pkmnData);
        Logger.statusLog(`finished ${fileName}`);
    }

    Logger.statusLog('finished adding lowest evos');
}

function setLowestEvolutions(pkmnData: PkmnDataJSONObj) {
    for (let pkmnName of Object.keys(pkmnData)) {
        const lowestEvo = findLowestEvo(pkmnName);
        pkmnData[pkmnName].lowestEvolution = lowestEvo;
    }
}

/**
 * finds lowest evolution of pkmnName and returns it
 * if pkmnName is a non permanent form, it returns an empty string
 * if pkmnName is already the lowest evolution, it returns an empty string
 */
function findLowestEvo(pkmnName: string): string {
    if (NON_PERMANENT_PKMN_FORMS.includes(pkmnName)) {
        return '';
    }
    //Logger.statusLog(`finding lowest evo for ${pkmnName}`);
    let lookedAtPkmn = evoData[pkmnName];
    if (lookedAtPkmn === undefined) {
        Logger.elog(`couldnt find evo data for ${pkmnName}`);
        return '';
    }
    while (lookedAtPkmn.pre !== '') {
        lookedAtPkmn = evoData[lookedAtPkmn.pre];
        if (lookedAtPkmn === undefined) {
            Logger.elog(`couldnt find evo data for ${pkmnName}`);
            return '';
        }
    }
    if (lookedAtPkmn.name === pkmnName) {
        return '';
    }
    //Logger.statusLog(`found ${lookedAtPkmn.name}`);
    return lookedAtPkmn.name;
}
