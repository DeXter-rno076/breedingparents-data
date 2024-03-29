import fs from 'fs';
import { PkmnEvolutionLink, AdjustedPkmnDataset } from '../types';
import Logger from '../Logger';
import { doToAllPlainPkmnDataFiles } from './utils';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';

//todo
const babys = JSON.parse(fs.readFileSync('data/in/babys.json', { encoding: 'utf-8' })) as string[];

const evoData = JSON.parse(fs.readFileSync('data/in/evos.json', { encoding: 'utf-8' })) as {
    [key: string]: PkmnEvolutionLink;
};

/**
 * finds and marks all unpairable pkmn
 * unpairable means, it can't get children => can't pass on moves
 *
 * looks for all pkmn with egg group Unbekannt, but handles babys seperatly
 * babys get the egg groups of their evo line so that their ability to inherit is accomplished
 *      but they are still excluded from the egg group list because they can't get children
 */
export default function handleUnpairables() {
    Logger.initLogs('handleUnpairables');
    Logger.statusLog(`finding and marking unpairable pkmn + adjusting some of their data`);

    doToAllPlainPkmnDataFiles(doShit);

    Logger.statusLog(`finished adjusting unpairables`);
}

function doShit(fileContent: AdjustedPkmnDataset) {
    setDefaultValueToAll(fileContent);
    handleBabys(fileContent);
    handleEggGroupsUnknowns(fileContent);
}

function setDefaultValueToAll(jsonPkmnData: AdjustedPkmnDataset) {
    for (const pkmn of Object.values(jsonPkmnData)) {
        pkmn.unpairable = false;
    }
}

function handleBabys(jsonPkmnData: AdjustedPkmnDataset) {
    Logger.statusLog(`adjusting data of babys`);
    for (let baby of babys) {
        const babyObj = jsonPkmnData[baby];
        if (babyObj === undefined) {
            //baby got added to the games in a later gen
            continue;
        }

        babyObj.unpairable = true;
        setBabyEggGroups(babyObj, jsonPkmnData);
    }
}

function handleEggGroupsUnknowns(jsonPkmnData: AdjustedPkmnDataset) {
    //Logger.statusLog(`adjusting data of egg group Unknown pkmn`);
    for (let pkmnName in jsonPkmnData) {
        const pkmnObj = jsonPkmnData[pkmnName];
        if (pkmnObj.eggGroup1 === undefined) {
            Logger.elog('handleEggGroupsUnknowns: ' + pkmnName + ' has no first egg group');
            continue;
        }
        if (pkmnObj.eggGroup1 === 'Unbekannt') {
            //Logger.statusLog(`found egg group Unknown pkmn ${pkmnObj.name}`);
            pkmnObj.unpairable = true;
        }
    }
}

/**
 * sets the egg groups of a baby pkmn to the egg groups of its evolutions
 * babys have the egg group Unbekannt but that would exclude them from possible breeding trees
 * to handle this aspect of the special case baby pkmn, we 'pfuschen' a little bit
 */
function setBabyEggGroups(babyPkmnObj: AdjustedPkmnJSON, jsonPkmnData: AdjustedPkmnDataset) {
    /* Logger.statusLog(
        `setting egg groups of baby ${babyPkmnObj.name} to those of its evos`
    ); */
    const babyPkmnName = babyPkmnObj.name;

    const firstEvoName = evoData[babyPkmnName].post;
    if (firstEvoName === undefined) {
        Logger.elog('setBabyEggGroups: couldnt find evolution of ' + babyPkmnName);
        return;
    }
    //Logger.statusLog(`first evo is ${firstEvoName}`);

    const firstEvoPkmnObj = jsonPkmnData[firstEvoName];
    if (firstEvoPkmnObj === undefined) {
        //evolution is not in the gen of the current file
        /* Logger.statusLog(
            `skipping because ${firstEvoName} is not in the currently handled gen`
        ); */
        return;
    }

    if (firstEvoPkmnObj.eggGroup1 !== undefined) {
        /* Logger.statusLog(
            `setting first egg group ${firstEvoPkmnObj.eggGroup1}`
        ); */
        babyPkmnObj.eggGroup1 = firstEvoPkmnObj.eggGroup1;
    } else if (firstEvoPkmnObj.eggGroup2 !== undefined) {
        Logger.elog('setBabyEggGroups: pkmn ' + firstEvoName + ' has egg group 2 but not egg group 1');
    }
    if (firstEvoPkmnObj.eggGroup2 !== undefined) {
        /* Logger.statusLog(
            `setting second egg group ${firstEvoPkmnObj.eggGroup2}`
        ); */
        babyPkmnObj.eggGroup2 = firstEvoPkmnObj.eggGroup2;
    }
}
