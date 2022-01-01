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

main();

async function main() {
    Logger.resetLogs();

    console.log(
        'building pkmn data sets...... (this will take several minutes (about 8-10 min))'
    );
    await createPkmnDataSets();

    console.log('adjusting pkmn data sets........');
    addOldGenLearnsets();
    handleUnpairables();
    handleUnbreedables();
    addLowestEvolution();
    replaceOldMoveNames();

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