import fs from 'fs';
import Logger from '../Logger';
import { MAX_FILE_LENGTH, NEWEST_GEN, OLDEST_GEN } from '../constants';
import { PkmnGameExclusives } from '../diffs_creation/PkmnGameExclusives';
import { PkmnGenSimilarities } from '../diffs_creation/PkmnGenSimilarities';
import { FilePathBuilder } from './FilePathBuilder';
import { FileLoader } from './FileLoader';
import { FileSaver } from './FileSaver';
import { GeneralUtils } from '../GeneralUtils';
import { FileSystemInitializer } from './FileSystemInitializer';

//pkmn objs arent added one by one but in sets
const PKMN_INTERVAL = 10;
/**
 * splits data output files
 * default MediaWiki config blocks e. g. Gen 8 pkmn data becaus it's too large
 */
export default function splitDataFiles() {
    Logger.initLogs('splitDataFiles');
    Logger.statusLog(`splitting data output files to not reach ${MAX_FILE_LENGTH} bytes`);

    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        splitFilesForGen(gen);
    }

    Logger.statusLog(`finished splitting output files`);
}

function splitFilesForGen(gen: number) {
    initGenFolder(gen);
    const files = getFileNames(gen);
    const pkmnFileNameRegex = /(?:commons|diffs_.*)\.json/;

    for (let fileName of files) {
        if (!pkmnFileNameRegex.test(fileName)) {
            continue;
        }
        Logger.statusLog(`splitting ${fileName}`);
        const pkmnData = JSON.parse(FileLoader.getFinalGenDatasetByFileName(gen, fileName));

        let currentNewDataMap = new Map<string, PkmnGameExclusives | PkmnGenSimilarities | string>();
        let currentLength = 0;
        let fileIndex = 1;

        const pkmnDataAttributes = Object.keys(pkmnData);
        for (let i = 0; i < pkmnDataAttributes.length; i += PKMN_INTERVAL) {
            const tmpMap = new Map<string, PkmnGameExclusives | PkmnGenSimilarities>();
            addSetOfPkmnsToMap(tmpMap, i, pkmnDataAttributes, pkmnData);
            currentLength += getMapLength(tmpMap);

            //formatting json about doubles the length and mediawiki does it automatically
            if (currentLength > MAX_FILE_LENGTH / 2) {
                //Logger.statusLog(`saving part ${fileIndex}`);
                currentNewDataMap.set('continue', 'dasMussHierStehen');
                saveMap(currentNewDataMap, gen, fileName, fileIndex);
                currentLength = 0;
                fileIndex++;
            }

            fuseMaps(currentNewDataMap, tmpMap);
        }

        saveMap(currentNewDataMap, gen, fileName, fileIndex);

        Logger.statusLog(`finished with ${fileName}`);
    }
}

function initGenFolder(gen: number) {
    const folderPath = FilePathBuilder.buildSplitFinalDatasetFolderPath(gen);
    FileSystemInitializer.createDirectoryIfNeeded(folderPath);
}

function getFileNames(gen: number): string[] {
    const dirPath = FilePathBuilder.buildFinalDatasetGenDirPath(gen);
    return fs.readdirSync(dirPath);
}

function getMapLength(map: Map<string, PkmnGameExclusives | PkmnGenSimilarities>): number {
    const objectPendant = GeneralUtils.mapToObject(map);
    const stringifiedObject = JSON.stringify(objectPendant);
    return stringifiedObject.length;
}

function addSetOfPkmnsToMap(
    tmpMap: Map<string, PkmnGameExclusives | PkmnGenSimilarities>,
    start: number,
    pkmnNames: string[],
    pkmnData: PkmnGameExclusives | PkmnGenSimilarities
) {
    /* Logger.statusLog(
        `adding pkmn objs from ${start} to ${
            start + PKMN_INTERVAL - 1
        } to data map`
    ); */
    for (let i = start; i < start + PKMN_INTERVAL; i++) {
        const pkmnName = pkmnNames[i];
        tmpMap.set(pkmnName, pkmnData[pkmnName]);
    }
}

function fuseMaps(
    normalMap: Map<string, PkmnGameExclusives | PkmnGenSimilarities | string>,
    tmpMap: Map<string, PkmnGameExclusives | PkmnGenSimilarities>
) {
    //Logger.statusLog(`fusing maps`);
    tmpMap.forEach((value, key) => {
        normalMap.set(key, value);
    });
}

function saveMap(
    dataMap: Map<string, PkmnGameExclusives | PkmnGenSimilarities | string>,
    gen: number,
    fileName: string,
    fileIndex: number
) {
    Logger.statusLog(`saving map to ${fileName}_${fileIndex}.json`);
    const obj = Object.fromEntries(dataMap);

    FileSaver.saveSplitFinalDataset(gen, fileName, fileIndex, JSON.stringify(obj));

    dataMap.clear();
}
