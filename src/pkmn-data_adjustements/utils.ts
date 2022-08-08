import { OLDEST_GEN, NEWEST_GEN } from '../constants';
import { PkmnGameExclusives } from '../diffs_creation/PkmnGameExclusives';
import { PkmnGenSimilarities } from '../diffs_creation/PkmnGenSimilarities';
import { FileLoader } from '../file_managing/FileLoader';
import { FileSaver } from '../file_managing/FileSaver';
import { AdjustedPkmnDataset } from '../types';

/**
 * todo these functions crush DRY principle
 */

export function doToAllPlainPkmnDataFiles(action: Function) {
    for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
        doToPlainGen(gen, action);
    }
}

export function doToAllSplitDataFiles(action: Function) {
	for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
		doToSplitGen(gen, action);
	}
}

function doToPlainGen(gen: number, action: Function) {
    const pkmnDatasetNames = FileLoader.getPlainGenPkmnDatasetNameList(gen);

    for (const fileName of pkmnDatasetNames) {
        const fileContent = FileLoader.getPlainGenPkmnDataSetByFileName(fileName, gen);
        const jsonFileContent = JSON.parse(fileContent) as AdjustedPkmnDataset;

        action(jsonFileContent);

        const newFileContent = JSON.stringify(jsonFileContent);

        FileSaver.savePlainGenPkmnDatasetByFileName(fileName, gen, newFileContent);
    }
}

function doToSplitGen (gen: number, action: Function) {
	const pkmnDatasetNames = FileLoader.getSplitGenDatasetNameList(gen);

	for (const fileName of pkmnDatasetNames) {
		const fileContent = FileLoader.getSplitGenDatasetByFileName(gen, fileName);
		const jsonFileContent = JSON.parse(fileContent) as {[key: string]: PkmnGenSimilarities | PkmnGameExclusives | string};

		action(jsonFileContent);

		const newFileContent = JSON.stringify(jsonFileContent);

		FileSaver.saveSplitFinalDatasetByFileName(gen, fileName, newFileContent);
	}
}