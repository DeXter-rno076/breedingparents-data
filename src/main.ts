import fs from 'fs';

import createPkmnDataSets from './pkmn-data/createPkmndata';
import handleUnpairables from './pkmn-data/handleUnpairables';
import handleUnbreedables from './pkmn-data/handleUnbreedables';
import addOldGenLearnsets from './pkmn-data/oldGenLearnsets';
import addLowestEvolution from './pkmn-data/addLowestEvolution';
import splitDataFiles from './splitDataFiles';
import createEggGroupData from './eggGroup-data/eggGroup-data';

import PkmnObjChecker from './PkmnObjChecker';
import Logger from './LogHandler';
import { replaceOldMoveNames } from './pkmn-data/replaceOldMoveNames';
import { DATA_OUTPUT_DIR, LOG_DIR, SEP_DATA_OUTPUT_DIR } from './constants';
import { handleIndividualSpecialCases } from './pkmn-data/individualSpecialCases';

main();

async function main() {
    setupFileStructure();
    Logger.resetLogs();

    console.log(
        'building pkmn data sets...... (this will take several minutes (about 8-10 min))'
    );
    await createPkmnDataSets();

    console.log('adjusting pkmn data sets........');
    replaceOldMoveNames();
    //lowestEvo data is needed for handleUnpairables()
    addLowestEvolution();
    handleUnpairables();
    handleUnbreedables();
    /*adding old gen learnsets should happen at the end because it depends
    on the learnsets that get adjusted by the other scripts */
    addOldGenLearnsets();
    handleIndividualSpecialCases();

    console.log('checking pkmn data sets for problems.......');
    const checker = new PkmnObjChecker();
    checker.testAll();

    console.log('splitting pkmn data set files.........');
    splitDataFiles();

    console.log('building egg group data sets.............');
    createEggGroupData();

    console.log('finished');

    if (Logger.getErrorOccured()) {
        console.log(
            'some problems occured. Definitely check log files in data/logs'
        );
    } else {
        console.log('no problems occured, all clear');
    }
    console.log('data files are in data/separatedoutput')
}

function setupFileStructure () {
    if (!fs.existsSync(DATA_OUTPUT_DIR)) {
        fs.mkdirSync(DATA_OUTPUT_DIR);
    }
    if (!fs.existsSync(SEP_DATA_OUTPUT_DIR)) {
        fs.mkdirSync(SEP_DATA_OUTPUT_DIR);
    }
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR);
    }
}