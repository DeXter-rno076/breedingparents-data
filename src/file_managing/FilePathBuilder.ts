import { Game } from '../types';
import { FINAL_DATASETS_DIR, PLAIN_DATASET_FILES_PKMN_DIR, SPLIT_FINAL_DATASETS_DIR } from '../constants';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';

export abstract class FilePathBuilder {
    /**
     * file path schemes
     * 		data/out/plain_gen_datasets/pkmn/gen/game.json
     *
     * 		data/out/final_datasets/pkmn/gen/common.json
     * 		data/out/final_datasets/pkmn/gen/game.json
     */

    public static buildPlainGenPkmnDirPath(gen: number): string {
        return PLAIN_DATASET_FILES_PKMN_DIR + '/g' + gen;
    }

    public static buildPlainGenPkmnFilePathByGame(gen: number, game: Game): string {
        return PLAIN_DATASET_FILES_PKMN_DIR + '/g' + gen + '/' + game + '.json';
    }

    public static buildPlainGenPkmnFilePathByFileName(gen: number, fileName: string): string {
        return PLAIN_DATASET_FILES_PKMN_DIR + '/g' + gen + '/' + fileName;
    }

    public static buildFinalDatasetGenDirPath(gen: number): string {
        return FINAL_DATASETS_DIR + '/g' + gen;
    }

    public static buildFinalDatasetPkmnCommonsPath(gen: number): string {
        return FINAL_DATASETS_DIR + '/g' + gen + '/commons.json';
    }

    public static buildFinalDatasetPkmnExclusivesPath(game: Game): string {
        const gen = GamesPerGenUtils.gameToGenNumber(game);
        return FINAL_DATASETS_DIR + '/g' + gen + '/diffs_' + game + '.json';
    }

    public static buildFinalDatasetFileNamePath(gen: number, fileName: string): string {
        return FINAL_DATASETS_DIR + '/g' + gen + '/' + fileName;
    }

    public static buildSplitFinalDatasetFolderPath(gen: number): string {
        return SPLIT_FINAL_DATASETS_DIR + '/g' + gen;
    }

    public static buildSplitFinalDatasetPath(gen: number, originalFileName: string, fileIndex: number): string {
        const finalFileName = originalFileName.replace('.json', '_' + fileIndex + '.json');
        return FilePathBuilder.buildSplitFinalDatasetFolderPath(gen) + '/' + finalFileName;
    }

    public static buildEggGroupDatasetPath(game: Game): string {
        const gen = GamesPerGenUtils.gameToGenNumber(game);
        return FINAL_DATASETS_DIR + '/g' + gen + '/egg-groups_' + game + '.json';
    }
}
