import { Template } from 'mediawiki-bot';
import Logger from '../Logger';
import { Game, PkmnGender } from '../types';
import { ParamNotFoundException } from './exceptions/ParamNotFoundException';
import { TemplateNotFoundException } from './exceptions/TemplateNotFoundException';
import { UnexpectedParamValueException } from './exceptions/UnexpectedParamValueException';
import { Pkmn } from './Pkmn';
import { PkmnInitializer } from './PkmnInitializer';
import { bot } from './main';
import { SpecialformsUtils } from '../external_data_utils/SpecialformsUtils';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';

export class PkmnFactory {
    private static readonly infoboxCache = new Map<string, Template>();
    private readonly pkmnName: string;
    private readonly game: Game;

    public constructor(pkmnName: string, game: Game) {
        this.pkmnName = pkmnName;
        this.game = game;
    }

    /**
     * @throws IdentifierNotFoundException, TemplateNotFoundException,
     * 	ParamNotFoundException, UnexpectedParamValueException
     */
    public async construct(): Promise<Pkmn> {
        const pkmnInfobox = await this.getPkmnInfobox();
        const pkmnInitializer: PkmnInitializer = {
            game: this.game,
            name: this.pkmnName,
            id: this.getPkmnNr(pkmnInfobox),
            gender: this.getPkmnGender(pkmnInfobox),
            eggGroup1: this.getEggGroup1(pkmnInfobox),
            eggGroup2: this.getEggGroup2(pkmnInfobox),
        };

        const adjustedInitializer = this.correctFirstEggGroupDoesntExistEdgeCase(pkmnInitializer);

        return new Pkmn(adjustedInitializer);
    }

    /**
     * @throws IdentifierNotFoundException, TemplateNotFoundException
     */
    private async getPkmnInfobox(): Promise<Template> {
        const normalFormName = SpecialformsUtils.getPkmnNormalFormName(this.pkmnName);
        const infoboxTemplate = await this.getInfoboxTemplate(normalFormName);

        return infoboxTemplate;
    }

    /**
     * @throws TemplateNotFoundException
     */
    private async getInfoboxTemplate(pkmnName: string): Promise<Template> {
        if (PkmnFactory.infoboxCache.has(pkmnName)) {
            //? why is the cachemap.has call not sufficient?
            const cachedTemplate = PkmnFactory.infoboxCache.get(pkmnName);
            if (cachedTemplate === undefined) {
                Logger.elog(
                    'cached template of ' +
                        pkmnName +
                        ' is undefined,' +
                        'even though this should have been caught by a map.has call'
                );
            } else {
                return cachedTemplate;
            }
        }

        const infobox = await this.loadInfoboxTemplateFromWiki(pkmnName);
        PkmnFactory.infoboxCache.set(pkmnName, infobox);

        return infobox;
    }

    /**
     * @throws TemplateNotFoundException
     */
    private async loadInfoboxTemplateFromWiki(pkmnName: string): Promise<Template> {
        const pkmnPageTemplates = await this.loadPkmnPageTemplates(pkmnName);
        return this.findInfoboxInPkmnPageTemplates(pkmnPageTemplates);
    }

    private async loadPkmnPageTemplates(pkmnName: string): Promise<Template[]> {
        let templates: Template[] = [];
        try {
            templates = await bot.getTemplates(pkmnName);
        } catch (e) {
            Logger.elog('error in loading pkmn page templates appeared: ' + e);
        }

        return templates;
    }

    /**
     * @throws TemplateNotFoundException
     */
    private findInfoboxInPkmnPageTemplates(pkmnPageTemplates: Template[]): Template {
        let infobox = pkmnPageTemplates.find((item) => {
            return item.title === 'Infobox Pokémon';
        });

        if (infobox === undefined) {
            infobox = this.tryFindingInfoboxInReplace(this.pkmnName, pkmnPageTemplates);
            if (infobox === undefined) {
                throw new TemplateNotFoundException('infobox', this.pkmnName);
            }
        }
        return infobox;
    }

    private tryFindingInfoboxInReplace(pkmnName: string, mainPageTemplates: Template[]): Template | undefined {
        const expectedReplaceString = '#replace:' + pkmnName;
        const replaceTemplate = mainPageTemplates.find((item) => {
            return item.title === expectedReplaceString;
        });
        if (replaceTemplate === undefined) {
            return undefined;
        }
        const firstParam = replaceTemplate.getParam('2');
        if (firstParam === null) {
            return undefined;
        }
        const paramTemplates = firstParam.templates;
        if (paramTemplates.length === 0) {
            return undefined;
        }
        const pkmnInfobox = paramTemplates[1];
        return pkmnInfobox;
    }

    /**
     * @throws IdentifierNotFoundException, ParamNotFoundException
     */
    private getPkmnNr(infobox: Template): string {
        if (SpecialformsUtils.isSpecialForm(this.pkmnName)) {
            return this.getSpecialFormNr();
        }
        const nrParam = infobox.getParam('Nr');
        if (nrParam === null) {
            throw new ParamNotFoundException('nr', 'Infobox of ' + this.pkmnName);
        }
        return nrParam.text.trim();
    }

    /**
     * @throws IdentifierNotFoundException
     */
    private getSpecialFormNr(): string {
        const identifierData = SpecialformsUtils.getSpecialformIdentifierData(this.pkmnName);
        return identifierData.nr.trim();
    }

    /**
     * @throws ParamNotFoundException, UnexpectedParamValueException
     */
    private getPkmnGender(infobox: Template): PkmnGender {
        const genderParam = infobox.getParam('Geschlecht');
        if (genderParam === null) {
            throw new ParamNotFoundException('Geschlecht', 'Infobox of ' + this.pkmnName);
        }

        const genderInfo = genderParam.text.trim();

        return this.parseGenderInfo(genderInfo);
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private parseGenderInfo(genderInfo: string): PkmnGender {
        const unknownRegex = /Unbekannt/;
        const singleGenderRegex = /^\s*?100\s*?%\s*?(\S)/;

        if (unknownRegex.test(genderInfo)) {
            return 'unknown';
        }

        const singleGenderRegexResult = singleGenderRegex.exec(genderInfo);

        if (singleGenderRegexResult === null) {
            return 'both';
        }

        const genderIdentifier = singleGenderRegexResult[1];
        if (genderIdentifier === '♀') {
            return 'female';
        }
        if (genderIdentifier === '♂') {
            return 'male';
        }

        throw new UnexpectedParamValueException(genderInfo, 'parsable gender string', 'Infobox of ' + this.pkmnName);
    }

    /**
     * @throws ParamNotFoundException, UnexpectedParamValueException
     */
    private getEggGroup1(infobox: Template): string {
        const eggGroup1Param = infobox.getParam('Ei-Gruppe');
        const eggGroup1ChangesParam = infobox.getParam('Ei-Gruppenänderung');

        if (eggGroup1Param === null) {
            throw new ParamNotFoundException('Ei-Gruppe', 'Infobox of ' + this.pkmnName);
        }

        if (eggGroup1ChangesParam === null) {
            return eggGroup1Param.text.trim();
        }

        const eggGroupChangesGenNumber = Number(eggGroup1ChangesParam.text);
        if (isNaN(eggGroupChangesGenNumber)) {
            throw new UnexpectedParamValueException(
                eggGroup1ChangesParam.text.trim(),
                'number',
                'Infobox of ' + this.pkmnName
            );
        }

        if (eggGroupChangesGenNumber <= GamesPerGenUtils.gameToGenNumber(this.game)) {
            return eggGroup1Param.text.trim();
        }

        return '';
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private getEggGroup2(infobox: Template): string {
        const eggGroup2Param = infobox.getParam('Ei-Gruppe2');
        const eggGroups2ChangesParam = infobox.getParam('Ei-Gruppenänderung2');

        if (eggGroup2Param === null) {
            if (eggGroups2ChangesParam !== null) {
                Logger.elog('egg group 2 is missing even though egg group 2 changes is set');
            }
            return '';
        }
        if (eggGroups2ChangesParam === null) {
            return eggGroup2Param.text.trim();
        }
        const changesGenNumber = Number(eggGroups2ChangesParam);
        if (isNaN(changesGenNumber)) {
            throw new UnexpectedParamValueException(
                eggGroups2ChangesParam.text.trim(),
                'number',
                'Infobox of ' + this.pkmnName
            );
        }

        if (changesGenNumber <= GamesPerGenUtils.gameToGenNumber(this.game)) {
            return eggGroup2Param.text.trim();
        }

        return '';
    }

    private correctFirstEggGroupDoesntExistEdgeCase (pkmnInitializer: PkmnInitializer): PkmnInitializer {
        if (pkmnInitializer.eggGroup1 === '') {
            pkmnInitializer.eggGroup1 = pkmnInitializer.eggGroup2;
            pkmnInitializer.eggGroup2 = '';
        }

        return pkmnInitializer;
    }
}
