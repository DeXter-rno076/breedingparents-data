import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export class OptionalBabysFactory extends ExternalDataUtilsFactory<string[]> {
    public constructor() {
        super('babysOptional.json');
        Logger.statusLog('building OptionalBabys instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): string[] {
        const optionalBabysArray: string[] = [];

        this.checkExternalJSON(externalJSON);

        for (const optionalBaby of Object.values(externalJSON)) {
            optionalBabysArray.push(optionalBaby);
        }

        return optionalBabysArray;
    }

    private checkExternalJSON(externalJSON: any) {
        if (!this.isStringArray(externalJSON)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'optional babys should be string array');
        }
    }
}
