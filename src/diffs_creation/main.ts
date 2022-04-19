import { FINAL_DATASETS_DIR, NEWEST_GEN, OLDEST_GEN } from '../constants';
import Logger from '../Logger';
import { GenerationDiff } from './GenerationDiff';
import { FileSystemInitializer } from '../file_managing/FileSystemInitializer';
import { FilePathBuilder } from '../file_managing/FilePathBuilder';
import { GeneralUtils } from '../GeneralUtils';

export function createAllDiffs() {
    Logger.initLogs('diffs_creation');
    initFileStructure(GeneralUtils.generateGenList());
    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        Logger.statusLog('creating diffs for gen ' + gen);
        const genDiff = new GenerationDiff(gen);
        genDiff.createSimsAndDiffs();
    }
}

function initFileStructure(gens: number[]) {
    FileSystemInitializer.createDirectoryIfNeeded(FINAL_DATASETS_DIR);
    for (const gen of gens) {
        const finalDatasetGenPath = FilePathBuilder.buildFinalDatasetGenDirPath(gen);
        FileSystemInitializer.createDirectoryIfNeeded(finalDatasetGenPath);
    }
}
