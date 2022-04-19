import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export class SpecialAtkRowFormSelectorsFactory extends ExternalDataUtilsFactory<Map<string, string[]>> {
    public constructor() {
        super('specialAtkRowFormSelectors.json');
        Logger.statusLog('building SpecialAtkRowFormSelectors instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): Map<string, string[]> {
        const specialAtkRowFormSelectors = new Map<string, string[]>();

        for (const [formSelector, forms] of Object.entries(externalJSON)) {
            this.checkFormSelector(formSelector);
            this.checkForms(forms);

            specialAtkRowFormSelectors.set(formSelector, forms);
        }

        return specialAtkRowFormSelectors;
    }

    private checkFormSelector(formSelector: any) {
        if (typeof formSelector !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'form selector should be string');
        }
    }

    private checkForms(forms: any) {
        if (!this.isStringArray(forms)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'selected forms should be a string array');
        }
    }
}
