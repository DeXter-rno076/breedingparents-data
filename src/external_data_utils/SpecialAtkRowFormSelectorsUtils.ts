import { SpecialAtkRowFormSelectorsFactory } from './factories/SpecialAtkRowFormSelectorsFactory';
import { UnexpectedParamValueException } from '../initial_pkmn-data/exceptions/UnexpectedParamValueException';

export abstract class SpecialAtkRowFormSelectorsUtils {
    private static specialAtkRowFormSelectorsFactory = new SpecialAtkRowFormSelectorsFactory();
    private static specialAtkRowFormSelectors = SpecialAtkRowFormSelectorsUtils.specialAtkRowFormSelectorsFactory.data;

    public static isSpecialAtkRowFormSelector(extraParamValue: string): boolean {
        return SpecialAtkRowFormSelectorsUtils.specialAtkRowFormSelectors.get(extraParamValue) !== undefined;
    }

    /**
     * @throws UnexpectedParamValueException
     */
    public static getFormsForSpecialAtkRowFormSelector(extraParamValue: string, pageName = ''): string[] {
        const forms = SpecialAtkRowFormSelectorsUtils.specialAtkRowFormSelectors.get(extraParamValue);
        if (forms === undefined) {
            throw new UnexpectedParamValueException('Extra', 'Multiple forms identifier', pageName);
        }
        return forms;
    }
}
