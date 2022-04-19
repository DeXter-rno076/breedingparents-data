import fs from 'fs';
import { DATA_IN_DIR } from '../../constants';

export abstract class ExternalDataUtilsFactory<T> {
    protected readonly FILE_NAME: string;
    public data: T;

    protected constructor(fileName: string) {
        this.FILE_NAME = fileName;
        const externalJSON = this.loadExternalJSON(fileName);
        this.data = this.externalJSONToInternalStructure(externalJSON);
    }

    private loadExternalJSON(fileName: string): object {
        return JSON.parse(this.loadFileSync(DATA_IN_DIR + '/' + fileName));
    }

    private loadFileSync(filePath: string): string {
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return fileContent;
    }

    /**
     * @throws UnexpectedExternalDataException
     */
    protected abstract externalJSONToInternalStructure(externalJSON: object): T;

    protected containsUndefinedOrNull(a: Array<any>): boolean {
        return this.testForAll(a, function (item) {
            return item === undefined || item === null;
        });
    }

    protected isStringArray(a: any): boolean {
        if (!Array.isArray(a)) {
            return false;
        }

        return this.areAllString(a);
    }

    protected areAllString(a: Array<any>): boolean {
        return this.testForAll(a, function (item) {
            return typeof item === 'string';
        });
    }

    private testForAll(arr: Array<any>, test: Function): boolean {
        for (const item of arr) {
            if (!test(item)) {
                return false;
            }
        }

        return true;
    }
}
