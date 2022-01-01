import fs from 'fs';
import { DATA_OUTPUT_DIR, SEP_DATA_OUTPUT_DIR } from './constants';
import { PkmnDataJSONObj } from './types';
import { PkmnObj } from './PkmnObj';
import { mapToObj, getObjJSONLength, getJSONPkmnData } from './utils';
import Logger from './LogHandler';
import { MAX_FILE_LENGTH } from './constants';

//pkmn objs arent added one by one but in sets
const PKMN_INTERVAL = 10;

/**
 * splits data output files
 * default MediaWiki config blocks e. g. Gen 8 pkmn data becaus it's too large
 */
export default function splitDataFiles() {
    Logger.initLogs('splitDataFiles');
    Logger.statusLog(
        `splitting data output files to not reach ${MAX_FILE_LENGTH} bytes`
    );
    const outputFiles = fs.readdirSync(DATA_OUTPUT_DIR);

    for (let file of outputFiles) {
        Logger.statusLog(`splitting ${file}`);
        const pkmnData = getJSONPkmnData(file);

        let currentNewDataMap = new Map<string, PkmnObj | string>();
        let currentLength = 0;
        let fileIndex = 1;

        const pkmnDataAttributes = Object.keys(pkmnData);
        for (let i = 0; i < pkmnDataAttributes.length; i += PKMN_INTERVAL) {
            const tmpMap = new Map<string, PkmnObj>();
            addSetOfPkmnsToMap(tmpMap, i, pkmnDataAttributes, pkmnData);
            currentLength += getObjJSONLength(mapToObj(tmpMap));

            //formatting json about doubles the length and mediawiki does it automatically
            if (currentLength > MAX_FILE_LENGTH / 2) {
                //Logger.statusLog(`saving part ${fileIndex}`);
                currentNewDataMap.set('continue', 'dasMussHierStehen');
                saveMap(currentNewDataMap, file, fileIndex);
                currentLength = 0;
                fileIndex++;
            }

            fuseMaps(currentNewDataMap, tmpMap);
        }

        saveMap(currentNewDataMap, file, fileIndex);

        Logger.statusLog(`finished with ${file}`);
    }
    Logger.statusLog(`finished splitting output files`);
}

function addSetOfPkmnsToMap(
    tmpMap: Map<string, PkmnObj>,
    start: number,
    pkmnNames: string[],
    pkmnData: PkmnDataJSONObj
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
    normalMap: Map<string, PkmnObj | string>,
    tmpMap: Map<string, PkmnObj>
) {
    //Logger.statusLog(`fusing maps`);
    tmpMap.forEach((value, key) => {
        normalMap.set(key, value);
    });
}

function saveMap(
    dataMap: Map<string, PkmnObj | string>,
    fileName: string,
    fileIndex: number
) {
    Logger.statusLog(`saving map to ${fileName}_${fileIndex}.json`);
    const obj = mapToObj(dataMap);
    const newFileName = fileName.replace('.json', '') + `_${fileIndex}.json`;
    fs.writeFileSync(
        SEP_DATA_OUTPUT_DIR + '/' + newFileName,
        JSON.stringify(obj)
    );

    dataMap.clear();
}
