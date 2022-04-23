import fs from 'fs';
import { DATA_IN_DIR, EXTRA_FILES_FOLDER } from '../constants';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { Game } from '../types';
import { FilePathBuilder } from './FilePathBuilder';

export abstract class FileLoader {
    public static getDataINFileContent(fileName: string): string {
        return FileLoader.loadFileSync(DATA_IN_DIR + '/' + fileName);
    }

    public static loadFileSync(filePath: string): string {
        return fs.readFileSync(filePath, { encoding: 'utf-8' });
    }

    public static getPlainGenPkmnDatasetByGame(game: Game): string {
        const gen = GamesPerGenUtils.gameToGenNumber(game);
        const filePath = FilePathBuilder.buildPlainGenPkmnFilePathByGame(gen, game);
        return FileLoader.loadFileSync(filePath);
    }

    public static getPlainGenPkmnDataSetByFileName(fileName: string, gen: number): string {
        const filePath = FilePathBuilder.buildPlainGenPkmnFilePathByFileName(gen, fileName);
        return FileLoader.loadFileSync(filePath);
    }

    public static getPlainGenPkmnDatasetNameList(gen: number): string[] {
        const filePath = FilePathBuilder.buildPlainGenPkmnDirPath(gen);
        return fs.readdirSync(filePath);
    }

	public static getSplitGenDatasetNameList (gen: number): string[] {
		const filePath = FilePathBuilder.buildSplitFinalDatasetFolderPath(gen);
		return fs.readdirSync(filePath);
	}

	public static getSplitGenDatasetByFileName (gen: number, fileName: string): string {
		const filePath = FilePathBuilder.buildSplitFinalDatasetPathByFileName(gen, fileName);
		return FileLoader.loadFileSync(filePath);
	}

    public static getFinalGenDatasetByFileName(gen: number, fileName: string): string {
        const filePath = FilePathBuilder.buildFinalDatasetFileNamePath(gen, fileName);
        return FileLoader.loadFileSync(filePath);
    }

	public static getFinalEggGroupDatasetByGame (game: Game): string {
		const filePath = FilePathBuilder.buildEggGroupDatasetPath(game);
		return FileLoader.loadFileSync(filePath);
	}

	public static getExtraFileNames (): string[] {
		return fs.readdirSync(EXTRA_FILES_FOLDER);
	}

	public static getExtraFileByFileName (fileName: string): string {
		return FileLoader.loadFileSync(EXTRA_FILES_FOLDER + '/' + fileName);
	}
}
