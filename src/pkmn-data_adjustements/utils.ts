import { OLDEST_GEN, NEWEST_GEN } from '../constants';
import { FileLoader } from '../file_managing/FileLoader';
import { FileSaver } from '../file_managing/FileSaver';
import { AdjustedPkmnDataset } from '../types';

export function doToAllPkmnDataFiles(action: Function) {
    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        doToGen(gen, action);
    }
}

function doToGen(gen: number, action: Function) {
    const pkmnDatasetNames = FileLoader.getPlainGenPkmnDatasetNameList(gen);

    for (const fileName of pkmnDatasetNames) {
        const fileContent = FileLoader.getPlainGenPkmnDataSetByFileName(fileName, gen);
        const jsonFileContent = JSON.parse(fileContent) as AdjustedPkmnDataset;

        action(jsonFileContent);

        const newFileContent = JSON.stringify(jsonFileContent);

        FileSaver.savePlainGenPkmnDatasetByFileName(fileName, gen, newFileContent);
    }
}
