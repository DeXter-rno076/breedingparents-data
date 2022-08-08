import { FileSystemInitializer } from "./file_managing/FileSystemInitializer";
import { DATA_OUT_DIR, FINAL_DATASETS_DIR, PLAIN_DATASET_FILES_DIR, LOG_DIR, EXTRA_FILES_FOLDER } from "./constants";
import Logger from "./Logger";

setupFileStructure();

function setupFileStructure() {
    FileSystemInitializer.createDirectoryIfNeeded(DATA_OUT_DIR);
    FileSystemInitializer.createDirectoryIfNeeded(FINAL_DATASETS_DIR);
    FileSystemInitializer.createDirectoryIfNeeded(PLAIN_DATASET_FILES_DIR);
	FileSystemInitializer.createDirectoryIfNeeded(EXTRA_FILES_FOLDER);

    FileSystemInitializer.createDirectoryIfNeeded(LOG_DIR);

    Logger.resetLogs();
}