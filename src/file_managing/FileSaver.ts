import fs from 'fs';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { Game } from '../types';
import { FilePathBuilder } from './FilePathBuilder';

export abstract class FileSaver {
    public static savePlainGenPkmnDatasetByGame(game: Game, newContent: string) {
        const gen = GamesPerGenUtils.gameToGenNumber(game);
        const filePath = FilePathBuilder.buildPlainGenPkmnFilePathByGame(gen, game);
        FileSaver.saveFileSync(filePath, newContent);
    }

    public static saveFileSync(filePath: string, newContent: string) {
        fs.writeFileSync(filePath, newContent);
    }

    public static savePlainGenPkmnDatasetByFileName(fileName: string, gen: number, newContent: string) {
        const filePath = FilePathBuilder.buildPlainGenPkmnFilePathByFileName(gen, fileName);
        FileSaver.saveFileSync(filePath, newContent);
    }

    public static saveFinalDatasetPkmnCommons(gen: number, newContent: string) {
        const filePath = FilePathBuilder.buildFinalDatasetPkmnCommonsPath(gen);
        FileSaver.saveFileSync(filePath, newContent);
    }

    public static saveFinalDatasetPkmnExclusives(game: Game, newContent: string) {
        const filePath = FilePathBuilder.buildFinalDatasetPkmnExclusivesPath(game);
        FileSaver.saveFileSync(filePath, newContent);
    }

    public static saveSplitFinalDataset(gen: number, originalFileName: string, fileIndex: number, newContent: string) {
        const filePath = FilePathBuilder.buildSplitFinalDatasetPath(gen, originalFileName, fileIndex);
        FileSaver.saveFileSync(filePath, newContent);
    }

    public static saveEggGroupDataset(game: Game, newContent: string) {
        const filePath = FilePathBuilder.buildEggGroupDatasetPath(game);
        FileSaver.saveFileSync(filePath, newContent);
    }
}
