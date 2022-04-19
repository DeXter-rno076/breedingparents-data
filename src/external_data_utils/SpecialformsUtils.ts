import { PkmnWithSpecialformsIdentifiersData, SpecialformsIdentifiersData } from '../types';
import { SpecialformsFactory } from './factories/SpecialformsFactory';
import { IdentifierNotFoundException } from '../initial_pkmn-data/exceptions/IdentifierNotFoundException';
import { Game } from '../types';
import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';

export abstract class SpecialformsUtils {
    private static specialformsFactory = new SpecialformsFactory();
    private static specialforms = SpecialformsUtils.specialformsFactory.data;

    public static hasSpecialForm(pkmnName: string): boolean {
        return SpecialformsUtils.specialforms.has(pkmnName);
    }

    public static isSpecialForm(pkmnName: string): boolean {
        try {
            SpecialformsUtils.getSpecialformIdentifierData(pkmnName);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getSpecialformIdentifierData(specialFormName: string): SpecialformsIdentifiersData {
        const normalFormIdentifier = SpecialformsUtils.getNormalformIdentifierOfSpecialForm(specialFormName);
        return SpecialformsUtils.getSpecialformIdentifierFromNormalFormIdentifier(
            normalFormIdentifier,
            specialFormName
        );
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getNormalformIdentifierOfSpecialForm(pkmnName: string): PkmnWithSpecialformsIdentifiersData {
        for (const identifierData of SpecialformsUtils.specialforms.values()) {
            if (SpecialformsUtils.identifierHasSpecialform(identifierData, pkmnName)) {
                return identifierData;
            }
        }

        throw new IdentifierNotFoundException(pkmnName);
    }

    private static identifierHasSpecialform(
        normalFormIdentifierData: PkmnWithSpecialformsIdentifiersData,
        specialFormName: string
    ): boolean {
        try {
            SpecialformsUtils.getSpecialformIdentifierFromNormalFormIdentifier(
                normalFormIdentifierData,
                specialFormName
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    private static getSpecialformIdentifierFromNormalFormIdentifier(
        identifierData: PkmnWithSpecialformsIdentifiersData,
        specialFormName: string
    ): SpecialformsIdentifiersData {
        if (identifierData.forms.has(specialFormName)) {
            return identifierData.forms.get(specialFormName);
        } else {
            throw new IdentifierNotFoundException(specialFormName);
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getPkmnNormalFormName(pkmnName: string): string {
        if (SpecialformsUtils.isSpecialForm(pkmnName)) {
            const normalFormIdentifier = SpecialformsUtils.getNormalformIdentifierOfSpecialForm(pkmnName);
            return normalFormIdentifier.name;
        } else {
            return pkmnName;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getFormTextidentifier(pkmnName: string, game: Game): string {
        if (SpecialformsUtils.hasSpecialForm(pkmnName)) {
            return SpecialformsUtils.getNormalFormTextIdentifier(pkmnName, game);
        } else {
            return SpecialformsUtils.getSpecialformTextidentifier(pkmnName, game);
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getNormalFormTextIdentifier(normalFormName: string, game: Game): string {
        const normalFormIdentifierData = SpecialformsUtils.specialforms.get(normalFormName);
        if (normalFormIdentifierData === undefined) {
            throw new IdentifierNotFoundException(normalFormName);
        }
        const gameTextIdentifier = normalFormIdentifierData.text_identifier.get(game);
        return gameTextIdentifier;
    }

    /**
     * @throws IdentifierNotFoundException
     */
    public static getSpecialformTextidentifier(specialFormName: string, game: Game): string {
        const identifierData = SpecialformsUtils.getSpecialformIdentifierData(specialFormName);
        const identifier = identifierData.text_identifier.get(game);
        if (identifier === undefined) {
            throw new IdentifierNotFoundException(specialFormName, game);
        }
        return identifier;
    }

    /**
     * @throws InvalidArgumentException
     */
    public static getSpecialformNamesFromNormalform(normalFormName: string): string[] {
        if (!this.specialforms.has(normalFormName)) {
            throw new InvalidArgumentException('normalFormName', 'name of normal form that has special forms');
        }
        const specialForms = this.specialforms.get(normalFormName).forms;
        const specialFormNames: string[] = [];
        for (const specialFormName of specialForms.keys()) {
            specialFormNames.push(specialFormName);
        }

        return specialFormNames;
    }

    public static getSpecialformsFromNormalform(normalFormName: string): Map<string, SpecialformsIdentifiersData> {
        if (!this.specialforms.has(normalFormName)) {
            throw new InvalidArgumentException('normalFormName', 'name of normal form with special forms');
        }
        return this.specialforms.get(normalFormName).forms;
    }
}
