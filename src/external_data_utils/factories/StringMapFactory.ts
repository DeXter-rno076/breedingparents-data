import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export abstract class StringMapFactory extends ExternalDataUtilsFactory<Map<string, string>> {
    protected constructor(fileName: string) {
        super(fileName);
        Logger.statusLog('building ' + fileName + ' instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): Map<string, string> {
        const t = new Map<string, string>();

        this.checkExternalJSON(externalJSON);

        for (const [k, v] of Object.entries(externalJSON)) {
            t.set(k, v);
        }

        return t;
    }

    private checkExternalJSON(externalJSON: any) {
        if (typeof externalJSON !== 'object') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'expected object');
        }
        for (const [k, v] of Object.entries(externalJSON)) {
            if (typeof k !== 'string' || typeof v !== 'string') {
                throw new UnexpectedExternalDataException(this.FILE_NAME, 'expected both string key and string value');
            }
        }
    }
}
