import fs from 'fs';

import { DATA_OUTPUT_DIR } from './constants';
import { PkmnDataJSONObj } from './types';
import { PkmnObj } from './PkmnObj';
import Logger from './LogHandler';

/**
 * loads and parses contents of fileName
 * @param fileName
 *
 * @returns data in fileName as JSON object
 */
export function getJSONPkmnData(fileName: string): PkmnDataJSONObj {
    const fileContent = fs.readFileSync(DATA_OUTPUT_DIR + '/' + fileName, {
        encoding: 'utf-8',
    });
    const pkmnData = JSON.parse(fileContent) as PkmnDataJSONObj;

    return pkmnData;
}

/**
 * @returns array of pkmn data output file names (output directory => not splitted)
 */
export function getPkmnDataFiles(): string[] {
    const eggGroupDataNameRegex = /eggGroup/i;
    const outputFiles = fs.readdirSync(DATA_OUTPUT_DIR);

    return outputFiles.filter((item) => {
        //egg group data files
        return !eggGroupDataNameRegex.test(item);
    });
}

/**
 * @param map map object
 *
 * @returns object representation of map
 */
export function mapToObj(map: Map<string, PkmnObj | string>): object {
    return Object.fromEntries(map);
}

/**
 * @param obj
 *
 * @returns string length of JSON representation of obj
 */
export function getObjJSONLength(obj: object): number {
    return JSON.stringify(obj).length;
}

/**
 * parses pkmnData to JSON string and saves it in fileName
 *
 * @param fileName
 * @param pkmnData
 */
export function savePkmnData(fileName: string, pkmnData: PkmnDataJSONObj) {
    Logger.statusLog(`saving ${fileName}`);
    fs.writeFileSync(
        DATA_OUTPUT_DIR + '/' + fileName,
        JSON.stringify(pkmnData)
    );
}
