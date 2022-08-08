import fs from 'fs';
import { PkmnEvolutionLink, AdjustedPkmnDataset } from '../types';
import Logger from '../Logger';
import { NON_PERMANENT_PKMN_FORMS } from '../constants';
import { doToAllPlainPkmnDataFiles } from './utils';
import { AdjustedPkmnJSON } from './AdjustedPkmnJSON';

//todo
const evoData = JSON.parse(fs.readFileSync('data/in/evos.json', { encoding: 'utf-8' })) as {
    [key: string]: PkmnEvolutionLink;
};

const babys = JSON.parse(fs.readFileSync('data/in/babys.json', { encoding: 'utf-8' })) as string[];

const optionalBabys = JSON.parse(fs.readFileSync('data/in/babysOptional.json', { encoding: 'utf-8' })) as string[];

/**
 * evolutions cannot be breeded
 * therefore they may only appear at the end of a breeding chain
 * this can be achieved by just removing their breeding learnsets
 * (additionally this removes irrelevant data => win win)
 */
export default function handleUnbreedables() {
    Logger.initLogs('handleUnbreedables');
    Logger.statusLog(`findind and marking unbreedables and adjusting some data of them`);

    doToAllPlainPkmnDataFiles(handleEvosAndOtherUnbreedables);

    Logger.statusLog(`finished working on unbreedables`);
}

function handleEvosAndOtherUnbreedables(pkmnData: AdjustedPkmnDataset) {
    setDefaultValueToAll(pkmnData);
    handleEvos(pkmnData);
    handleOtherUnbreedables(pkmnData);
}

function setDefaultValueToAll(pkmnData: AdjustedPkmnDataset) {
    for (const pkmn of Object.values(pkmnData)) {
        pkmn.unbreedable = false;
    }
}

function handleEvos(pkmnData: AdjustedPkmnDataset) {
    Logger.statusLog(`working through evos`);
    for (let pkmnName in pkmnData) {
        //Logger.statusLog(`handling ${pkmnName}`);

        const pkmnObj = pkmnData[pkmnName];
        const pkmnEvoData = evoData[pkmnName];

        if (pkmnEvoData === undefined) {
            if (!NON_PERMANENT_PKMN_FORMS.includes(pkmnName)) {
                Logger.wlog(
                    'removeBreedingLearnsetsFromEvos: ' +
                        pkmnName +
                        ' has no evo data (if this is a non permanent form this doesnt matter)'
                );
            }
            continue;
        }
        const predecessor = pkmnEvoData.pre;

        if (predecessor === '') {
            /* Logger.statusLog(
                `skipping ${pkmnName} because it\'s the first evo in its evo line`
            ); */
            //pkmn is the first stage in its evo line
            continue;
        }

        if (optionalBabys.includes(predecessor)) {
            /* Logger.statusLog(
                `skipping ${pkmnName} because its predecessor is a optional baby => ${pkmnName} is handled as a first evo`
            ); */
            //predecessor is an optional baby => current pkmn is handled as first evo stage
            continue;
        }

        markUnbreedable(pkmnObj);
    }
}

function handleOtherUnbreedables(pkmnData: AdjustedPkmnDataset) {
    Logger.statusLog(`working through other unbreedables i.e. egg group Unknown pkmn except of babys`);
    for (let pkmnName in pkmnData) {
        const pkmnObj = pkmnData[pkmnName];

        if (pkmnObj.unpairable && !babys.includes(pkmnName)) {
            markUnbreedable(pkmnObj);
        }
    }
}

function markUnbreedable(pkmnObj: AdjustedPkmnJSON) {
    //Logger.statusLog(`marking ${pkmnObj.name}`);
    pkmnObj.unbreedable = true;
    pkmnObj.breedingLearnsets = [];
}
