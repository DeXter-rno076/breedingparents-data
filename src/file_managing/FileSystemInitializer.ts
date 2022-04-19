import fs from 'fs';

export class FileSystemInitializer {
    public static createDirectoryIfNeeded(directoryPath: string) {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
    }
}
