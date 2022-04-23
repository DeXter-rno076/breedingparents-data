import { DATA_OUT_DIR, FINAL_DATASETS_DIR, LOG_DIR, PLAIN_DATASET_FILES_DIR } from './constants';
import Logger from './Logger';
import { FileSystemInitializer } from './file_managing/FileSystemInitializer';
import { createInitialPkmnDataSets } from './initial_pkmn-data/main';
import { addEvolutions } from './pkmn-data_adjustements/addEvolutions';
import addLowestEvolution from './pkmn-data_adjustements/addLowestEvolution';
import handleUnpairables from './pkmn-data_adjustements/handleUnpairables';
import handleUnbreedables from './pkmn-data_adjustements/handleUnbreedables';
import { handleIndividualSpecialCases } from './pkmn-data_adjustements/individualSpecialCases';
import addOldGenLearnsets from './pkmn-data_adjustements/oldGenLearnsets';
import { replaceOldMoveNames } from './pkmn-data_adjustements/replaceOldMoveNames';
import { setExists } from './pkmn-data_adjustements/setExists';
import { createAllDiffs } from './diffs_creation/main';
import createEvoData from './pkmn-data_adjustements/createEvoData';
import { namesToLowerCase } from './pkmn-data_adjustements/namesToLowerCase';
import splitDataFiles from './file_managing/splitDataFiles';
import createEggGroupData from './eggGroup-data/eggGroup-data';

main();

async function main() {
    setupFileStructure();
    await createEvoData();

    await createInitialPkmnDataSets();

    setExists();
    addEvolutions();
    addLowestEvolution();
    //!unpairables BEFORE unbreedable
    handleUnpairables();
    handleUnbreedables();
    handleIndividualSpecialCases();
    //!addOldGenLearnsets AFTER setExists
    addOldGenLearnsets();

    //!last adjustements
    replaceOldMoveNames();
    namesToLowerCase();

    createAllDiffs();

    //checkDataFiles();

    //createGlobalConfig();

    createEggGroupData();
    splitDataFiles();
    /**
     * create global config file:
     * 		{
     * 			config: { Zeug wie voting und leader }
     * 			pkmnNames: []
     * 			moves: {normal:[], dyna:[], giga:[], ...}
     * 			...
     * 		}
     */
}

function setupFileStructure() {
    FileSystemInitializer.createDirectoryIfNeeded(DATA_OUT_DIR);
    FileSystemInitializer.createDirectoryIfNeeded(FINAL_DATASETS_DIR);
    FileSystemInitializer.createDirectoryIfNeeded(PLAIN_DATASET_FILES_DIR);

    FileSystemInitializer.createDirectoryIfNeeded(LOG_DIR);

    Logger.resetLogs();
}
