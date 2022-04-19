import { GAME_SK_LIST } from '../../constants';
import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { PkmnWithSpecialformsIdentifiersData, SpecialformsIdentifiersData, Game } from '../../types';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export class SpecialformsFactory extends ExternalDataUtilsFactory<Map<string, PkmnWithSpecialformsIdentifiersData>> {
    public constructor() {
        super('specialforms.json');
        Logger.statusLog('building Specialforms instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): Map<string, PkmnWithSpecialformsIdentifiersData> {
        const specialFormsMap = new Map<string, PkmnWithSpecialformsIdentifiersData>();

        if (!Array.isArray(externalJSON)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'specialforms must be in an array');
        }

        for (const formIdentifier of externalJSON) {
            const parsedFormIdentifier = this.parseFormIdentifier(formIdentifier);
            specialFormsMap.set(parsedFormIdentifier.name, parsedFormIdentifier);
        }

        return specialFormsMap;
    }

    private parseFormIdentifier(formIdentifier: any): PkmnWithSpecialformsIdentifiersData {
        if (typeof formIdentifier !== 'object') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'form identifier must be an object');
        }

        const name = formIdentifier.name;
        const textIdentifier = this.parseTextIdentifier(formIdentifier.text_identifier);
        const doesntExistIn = formIdentifier.doesnt_exist_in;
        this.checkName(name);
        this.checkDoesntExistIn(doesntExistIn);

        const specialForms = this.parseSpecialformIdentifiers(formIdentifier.forms);

        return {
            name,
            text_identifier: textIdentifier,
            doesnt_exist_in: doesntExistIn,
            forms: specialForms,
        };
    }

    private parseTextIdentifier(textIdentifiers: any): Map<Game, string> {
        if (typeof textIdentifiers !== 'object') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'text identifiers must be an object');
        }

        const textIdentifierMap = new Map<Game, string>();

        for (const [game, textIdentifier] of Object.entries(textIdentifiers)) {
            this.checkGame(game);
            this.checkTextIdentifier(textIdentifier);

            textIdentifierMap.set(game as Game, textIdentifier as string);
        }

        return textIdentifierMap;
    }

    private checkGame(game: any) {
        if (typeof game !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'game of text identifier must be a string');
        }

        if (!GAME_SK_LIST.includes(game)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'unknown game set for text identifier: ' + game);
        }
    }

    private checkTextIdentifier(textIdentifier: any) {
        if (typeof textIdentifier !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'text identifier must be a string');
        }
    }

    private checkName(name: any) {
        if (typeof name !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'pkmn name must be a string');
        }
    }

    private checkDoesntExistIn(textIdentifier: any) {
        if (!this.isStringArray(textIdentifier)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'doesnt_exist_in must be a string array');
        }
    }

    private parseSpecialformIdentifiers(specialforms: any): Map<string, SpecialformsIdentifiersData> {
        if (!Array.isArray(specialforms)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'forms must be an array');
        }
        const specialformsMap = new Map<string, SpecialformsIdentifiersData>();

        for (const specialform of specialforms) {
            const parsedSpecialform = this.parseSpecialform(specialform);
            specialformsMap.set(parsedSpecialform.name, parsedSpecialform);
        }

        return specialformsMap;
    }

    private parseSpecialform(specialform: any): SpecialformsIdentifiersData {
        if (typeof specialform !== 'object') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'specialform must be an object');
        }

        const name = specialform.name;
        const nr = specialform.nr;
        const doesntExistIn = specialform.doesnt_exist_in;
        const textIdentifiers = this.parseTextIdentifier(specialform.text_identifier);

        this.checkName(name);
        this.checkNr(nr);
        this.checkDoesntExistIn(doesntExistIn);

        return {
            name,
            nr,
            doesnt_exist_in: doesntExistIn,
            text_identifier: textIdentifiers,
        };
    }

    private checkNr(id: any) {
        if (typeof id !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'id must be a string: ' + id);
        }
    }
}
