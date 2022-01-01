import fs from 'fs';
import { getJSONPkmnData, getPkmnDataFiles, savePkmnData } from '../utils';
import { EvolutionsData, PkmnDataJSONObj } from '../types';
import { PkmnObj } from '../PkmnObj';
import Logger from '../LogHandler';
import { NON_PERMANENT_PKMN_FORMS } from '../constants';

const evoData = JSON.parse(
    fs.readFileSync('data/evos.json', { encoding: 'utf-8' })
) as { [key: string]: EvolutionsData };

const babys = JSON.parse(
    fs.readFileSync('data/babys.json', { encoding: 'utf-8' })
) as string[];

const optionalBabys = JSON.parse(
    fs.readFileSync('data/babysOptional.json', { encoding: 'utf-8' })
) as string[];

/**
 * evolutions cannot be breeded
 * therefore they may only appear at the end of a breeding chain
 * this can be achieved by just removing their breeding learnsets
 * (additionally this removes irrelevant data => win win)
 */
export default function handleUnbreedables() {
    Logger.initLogs('handleUnbreedables');
    Logger.statusLog(
        `findind and marking unbreedables and adjusting some data of them`
    );

    const pkmnDataFiles = getPkmnDataFiles();

    for (let fileName of pkmnDataFiles) {
        Logger.statusLog(`working through ${fileName}`);
        const pkmnData = getJSONPkmnData(fileName);
        handleEvos(pkmnData);
        handleOtherUnbreedables(pkmnData);
        savePkmnData(fileName, pkmnData);
        Logger.statusLog(`finished ${fileName}`);
    }
    Logger.statusLog(`finished working on unbreedables`);
}

function handleEvos(pkmnData: PkmnDataJSONObj) {
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

function handleOtherUnbreedables(pkmnData: PkmnDataJSONObj) {
    Logger.statusLog(
        `working through other unbreedables i.e. egg group Unknown pkmn except of babys`
    );
    for (let pkmnName in pkmnData) {
        const pkmnObj = pkmnData[pkmnName];

        if (pkmnObj.unpairable && !babys.includes(pkmnName)) {
            markUnbreedable(pkmnObj);
        }
    }
}

function markUnbreedable(pkmnObj: PkmnObj) {
    //Logger.statusLog(`marking ${pkmnObj.name}`);
    pkmnObj.unbreedable = true;
    pkmnObj.breedingLearnsets = [];
}
