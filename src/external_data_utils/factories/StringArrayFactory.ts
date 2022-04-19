import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export abstract class StringArrayFactory extends ExternalDataUtilsFactory<string[]> {
    protected constructor(fileName: string) {
        super(fileName);
        Logger.statusLog('building ' + fileName + ' instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): string[] {
        const t: string[] = [];

        this.checkExternalJSON(externalJSON);

        for (const item of Object.values(externalJSON)) {
            t.push(item);
        }

        return t;
    }

    private checkExternalJSON(externalJSON: any) {
        if (!this.isStringArray(externalJSON)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'data should be a string array');
        }
    }
}
