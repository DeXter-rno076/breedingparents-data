import { PageDoesNotExistError, Parameter, Section, Template } from 'mediawiki-bot';
import { LEARNSET_SUBPAGE_SUFFIX, BLOCKED_LEARNSET_TYPES } from '../constants';
import Logger from '../Logger';
import { Game, LearnsetType } from '../types';
import { ParamNotFoundException } from './exceptions/ParamNotFoundException';
import { TemplateNotFoundException } from './exceptions/TemplateNotFoundException';
import { LearnsetRow } from './LearnsetRow';
import { LearnsetTable } from './LearnsetTable';
import { Pkmn } from './Pkmn';
import { bot } from './main';
import { SpecialformsUtils } from '../external_data_utils/SpecialformsUtils';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { GeneralUtils } from '../GeneralUtils';
import { SkUtils } from '../SkUtils';
import { SpecialAtkRowFormSelectorsUtils } from '../external_data_utils/SpecialAtkRowFormSelectorsUtils';
import { UnexpectedParamValueException } from './exceptions/UnexpectedParamValueException';
import { IdentifierNotFoundException } from './exceptions/IdentifierNotFoundException';

export class LearnsetTablesFactory {
    private static readonly learnsetCache = new Map<string, Template[]>();
    private static readonly sectionsCache = new Map<string, Section[]>();
    private readonly pkmn: Pkmn;
    private readonly pkmnName: string;
    private readonly game: Game;

    public constructor(pkmn: Pkmn) {
        this.pkmn = pkmn;
        this.pkmnName = pkmn.getName();
        this.game = pkmn.getGame();
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError,
     * 	UnexpectedParamValueException, ParamNotFoundException
     */
    public async construct(): Promise<LearnsetTable[]> {
        let learnsetTables = await this.getLearnsetTables();

        learnsetTables = this.filterOutTables(learnsetTables);
        learnsetTables = await this.filterOutRows(learnsetTables);

        return this.instantiateLearnsetTables(learnsetTables);
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError, UnexpectedParamValueException
     */
    private async getLearnsetTables(): Promise<Template[]> {
        if (await this.hasSplitSections()) {
            return this.getLearnsetTablesFromFormSpecificSection();
        }
        return this.loadLearnsettablesFromMainsection();
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError
     */
    private async hasSplitSections(): Promise<boolean> {
        return (await this.getSectionsForTargetedGen()).length > 1;
    }

    private hasSpecialform(): boolean {
        return SpecialformsUtils.hasSpecialForm(this.pkmnName);
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError
     */
    private async getSectionsForTargetedGen(): Promise<Section[]> {
        const learnsetSubpageSections = await this.loadLearnsetSubpageSections();
        return this.filterGenSections(learnsetSubpageSections);
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError
     */
    private async loadLearnsetSubpageSections(): Promise<Section[]> {
        const normalFormName = SpecialformsUtils.getPkmnNormalFormName(this.pkmnName);

        const cachedSections = LearnsetTablesFactory.sectionsCache.get(normalFormName);
        if (cachedSections !== undefined) {
            return cachedSections;
        }

        try {
            const learnsetSubpageSections = await bot.getSections(normalFormName + LEARNSET_SUBPAGE_SUFFIX);

            LearnsetTablesFactory.sectionsCache.set(normalFormName, learnsetSubpageSections);

            return learnsetSubpageSections;
        } catch (e) {
            Logger.wlog(this.pkmnName + LEARNSET_SUBPAGE_SUFFIX + ' probably doesnt exist');
            LearnsetTablesFactory.sectionsCache.set(normalFormName, []);
            return [];
        }
    }

    private filterGenSections(sections: Section[]): Section[] {
        return sections.filter((item) => {
            return item.line.includes(GamesPerGenUtils.gameToGenNumber(this.game) + '. Generation');
        });
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError
     */
    private async getLearnsetTablesFromFormSpecificSection(): Promise<Template[]> {
        try {
            const specialformSectiontitle = this.buildFormSectionTitle();
            const learnsetTables = await this.loadLearnsettables(specialformSectiontitle);

            return this.filterOutNonLearnsettables(learnsetTables);
        } catch (e) {
            if (e instanceof IdentifierNotFoundException) {
                return [];
            }
            throw e;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    private buildFormSectionTitle(): string {
        const formTextIdentifier = SpecialformsUtils.getFormTextidentifier(this.pkmnName, this.game);

        let formSectionTitle = GamesPerGenUtils.gameToGenNumber(this.game) + '. Generation';

        if (formTextIdentifier !== '') {
            formSectionTitle += ' (' + formTextIdentifier + ')';
        }

        return formSectionTitle;
    }

    /**
     * @throws IdentifierNotFoundException, SectionNotFoundError
     */
    private async loadLearnsettables(sectionTitle: string | undefined): Promise<Template[]> {
        const learnsetSubpageTitle = this.buildLearnsetSubpageTitle();
        const learnsetCacheIdentifier = this.buildLearnsetCacheIdentifier(learnsetSubpageTitle, sectionTitle);

        const cachedTables = LearnsetTablesFactory.learnsetCache.get(learnsetCacheIdentifier);
        if (cachedTables !== undefined) {
            const copiedCachedTables = this.deepCopyTemplates(cachedTables);
            return copiedCachedTables;
        }

        try {
            const templates = await bot.getTemplates(learnsetSubpageTitle, sectionTitle);
            const learnsetTables = this.filterOutNonLearnsettables(templates);

            const copiedTables = this.deepCopyTemplates(learnsetTables);
            LearnsetTablesFactory.learnsetCache.set(learnsetCacheIdentifier, copiedTables);

            return learnsetTables;
        } catch (e) {
            if (e instanceof PageDoesNotExistError) {
                Logger.wlog('learnset subpage of ' + this.pkmnName + ' does not exist');
                LearnsetTablesFactory.learnsetCache.set(learnsetCacheIdentifier, []);
                return [];
            }
            throw e;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    private buildLearnsetSubpageTitle(): string {
        return SpecialformsUtils.getPkmnNormalFormName(this.pkmnName) + LEARNSET_SUBPAGE_SUFFIX;
    }

    private buildLearnsetCacheIdentifier(learnsetSubpageTitle: string, sectionTitle: string | undefined): string {
        if (sectionTitle === undefined) {
            return learnsetSubpageTitle;
        }
        return learnsetSubpageTitle + '#' + sectionTitle;
    }

    private deepCopyTemplates(templates: Template[]): Template[] {
        const copiedTemplates: Template[] = [];
        for (const table of templates) {
            copiedTemplates.push(this.deepCopyTemplate(table));
        }
        return copiedTemplates;
    }

    private deepCopyTemplate(learnsetTable: Template): Template {
        const tableCopy = new Template(learnsetTable._title, learnsetTable.index);
        tableCopy.params = this.deepCopyParameters(learnsetTable.params);
        return tableCopy;
    }

    private deepCopyParameters(params: Parameter[]): Parameter[] {
        const parametersCopy: Parameter[] = [];
        for (const param of params) {
            parametersCopy.push(this.deepCopyParameter(param));
        }

        return parametersCopy;
    }

    private deepCopyParameter(param: Parameter): Parameter {
        const paramCopy = new Parameter(param.title, param.indexed);
        paramCopy.text = param.text;
        paramCopy.templates = this.deepCopyTemplates(param.templates);
        return paramCopy;
    }

    private filterOutNonLearnsettables(templates: Template[]): Template[] {
        return templates.filter((template) => {
            return template.title === 'Atk-Table';
        });
    }

    /**
     * @throws UnexpectedParamValueException, IdentifierNotFoundException, SectionNotFoundError
     */
    private async loadLearnsettablesFromMainsection(): Promise<Template[]> {
        const learnsetTables = await this.loadLearnsettables(undefined);
        return this.filterOutTablesFromOtherGens(learnsetTables);
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private filterOutTablesFromOtherGens(learnsetTables: Template[]): Template[] {
        return learnsetTables.filter((table) => {
            const gParam = table.getParam('g');
            if (gParam === null) {
                Logger.elog('learnset table of ' + this.pkmnName + ' has no g param set:\n' + table.toString());
                return false;
            }

            const tableGen = Number(gParam);
            const thisGen = GamesPerGenUtils.gameToGenNumber(this.game);
            return tableGen === thisGen;
        });
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private filterOutTables(learnsetTables: Template[]): Template[] {
        return learnsetTables.filter((table) => {
            return !this.learnsetTableIsBlockedLearnsetType(table) && !this.learnsetTableIsFromOtherGame(table);
        });
    }

    private learnsetTableIsBlockedLearnsetType(learnsetTable: Template): boolean {
        const artParam = learnsetTable.getParam('Art');
        if (artParam === null) {
            Logger.elog('learnset table of ' + this.pkmnName + ' has no Art param set');
            return true;
        }

        const learnsetType = GeneralUtils.validateLearnsetType(artParam.text.trim());

        return BLOCKED_LEARNSET_TYPES.includes(learnsetType);
    }

    private learnsetTableIsFromOtherGame(learnsetTable: Template): boolean {
        const skParam = learnsetTable.getParam('sk');
        if (skParam === null) {
            if (this.checkPkmnReleasedInTheMiddleOfAGenSpecialCases() || this.checkLGPESpecialCases()) {
                return true;
            }
            return false;
        }

        const gameList = SkUtils.extractGamesFromSkParameter(skParam, this.pkmnName);

        return !gameList.includes(this.game);
    }

    private checkPkmnReleasedInTheMiddleOfAGenSpecialCases(): boolean {
        //todo put this in constants.ts
        const lgpeOnlyPkmn = ['Meltan', 'Melmetal'];
        const gen = GamesPerGenUtils.gameToGenNumber(this.game);
        if (gen === 7 && this.isNotLGPE() && lgpeOnlyPkmn.includes(this.pkmnName)) {
            //if this method is called the learnset table has no sks set
            //Meltan and Melmetal in Gen 7 only appear in LGPE -> all other games must be blocked
            return true;
        }

        return false;
    }

    private isNotLGPE(): boolean {
        return this.game !== 'LGP' && this.game !== 'LGE';
    }

    private checkLGPESpecialCases(): boolean {
        if (this.isNotLGPE()) {
            return false;
        }
        const pkmnId = Number(this.pkmn.getId());
        if (pkmnId > 151 && pkmnId !== 808 && pkmnId !== 809) {
            return true;
        }
    }

    /**
     * @throws ParamNotFoundException, IdentifierNotFoundException, SectionNotFoundError
     */
    private async filterOutRows(learnsetTables: Template[]): Promise<Template[]> {
        if (this.hasSpecialform() || this.isSpecialform()) {
            learnsetTables = this.filterOutRowsFromOtherForms(learnsetTables);
        }
        learnsetTables = this.filterOutRowsFromOtherGames(learnsetTables);
        learnsetTables = this.filterOutTutorRowsFromOtherGames(learnsetTables);

        return learnsetTables;
    }

    private isSpecialform(): boolean {
        return SpecialformsUtils.isSpecialForm(this.pkmnName);
    }

    /**
     * @throws IdentifierNotFoundException, ParamNotFoundException
     */
    private filterOutRowsFromOtherForms(learnsetTables: Template[]): Template[] {
        return this.filterOutRowsWithCondition(learnsetTables, this.atkRowBelongsToOtherForm);
    }

    /**
     * todo involve LearnsetRow class (conditions can or are already outsourced to there)
     * @throws ParamNotFoundException
     */
    private filterOutRowsWithCondition(learnsetTables: Template[], condition: Function): Template[] {
        for (const table of learnsetTables) {
            const atkRowsParam = table.getParam('1');
            if (atkRowsParam === null) {
                throw new ParamNotFoundException('first param', 'Atk-Table of ' + this.pkmnName);
            }
            const atkRowTemplates = atkRowsParam.templates;

            for (let i = 0; i < atkRowTemplates.length; i++) {
                const atkRow = atkRowTemplates[i];
                if (condition(this, atkRow)) {
                    this.removeAtkRowFromParam(atkRowsParam, atkRow.index);
                    i--;
                }
            }
        }

        return learnsetTables;
    }

    /**
     * todo split up
     * @throws IdentifierNotFoundException
     */
    private atkRowBelongsToOtherForm(factory: LearnsetTablesFactory, atkRow: Template): boolean {
        if (factory.isSpecialformAndDoesntExistInThisGame()) {
            return true;
        }

        const extraParam = atkRow.getParam('Extra');
        const gameParam = atkRow.getParam('Game');
        if (extraParam === null && gameParam === null) {
            return false;
        }
        if (extraParam !== null && gameParam !== null) {
            throw new UnexpectedParamValueException('both Extra and Game set', 'only one of them', factory.pkmnName);
        }

        let formIdentifier = '';
        if (extraParam !== null) {
            formIdentifier = extraParam.text.trim();
        } else {
            if (gameParam.templates.length > 0) {
                //probably has sk template
                return false;
            }
            formIdentifier = gameParam.text.trim();
        }

        return !factory.formIdentifierEqualsThisForm(formIdentifier);
    }

    private isSpecialformAndDoesntExistInThisGame(): boolean {
        if (!this.isSpecialform()) {
            return false;
        }

        try {
            SpecialformsUtils.getSpecialformTextidentifier(this.pkmnName, this.game);
            return false;
        } catch (e) {
            return true;
        }
    }

    /**
     * @throws IdentifierNotFoundException
     */
    private formIdentifierEqualsThisForm(atkRowFormValue: string): boolean {
        const thisFormIdentifier = SpecialformsUtils.getFormTextidentifier(this.pkmnName, this.game);

        const formIdentifierFromAtkRow = this.parseAtkRowFormValue(atkRowFormValue);

        return formIdentifierFromAtkRow.includes(thisFormIdentifier);
    }

    private parseAtkRowFormValue(atkRowFormValue: string): string[] {
        try {
            return SpecialAtkRowFormSelectorsUtils.getFormsForSpecialAtkRowFormSelector(atkRowFormValue, this.pkmnName);
        } catch (e) {
            return [atkRowFormValue];
        }
    }

    private removeAtkRowFromParam(atkRowsParam: Parameter, atkRowIndex: number) {
        try {
            const atkRowArrayIndex = this.getAtkRowArrayIndex(atkRowsParam.templates, atkRowIndex);
            atkRowsParam.templates.splice(atkRowArrayIndex, 1);
            atkRowsParam.text = atkRowsParam.text.replace('##TEMPLATE:' + atkRowIndex + '##', '');
        } catch (e) {
            Logger.elog('couldnt find atk row with index ' + atkRowIndex + ' for pkmn ' + this.pkmnName);
        }
    }

    /**
     * @throws TemplateNotFoundException
     */
    private getAtkRowArrayIndex(atkRows: Template[], atkRowIndex: number): number {
        for (let i = 0; i < atkRows.length; i++) {
            if (atkRows[i].index === atkRowIndex) {
                return i;
            }
        }

        throw new TemplateNotFoundException('AtkRow with index ' + atkRowIndex, this.pkmnName);
    }

    /**
     * @throws ParamNotFoundException
     */
    private filterOutRowsFromOtherGames(learnsetTables: Template[]): Template[] {
        return this.filterOutRowsWithCondition(learnsetTables, this.atkRowIsFromOtherGame);
    }

    /**
     * @throws UnexceptedParamValueException
     */
    private atkRowIsFromOtherGame(factory: LearnsetTablesFactory, atkRow: Template): boolean {
        const gameParam = atkRow.getParam('Game');
        if (gameParam === null) {
            return false;
        }

        if (gameParam.templates.length === 0) {
            return false;
        }

        const gameList = SkUtils.extractGamesFromSkParameter(gameParam, factory.pkmnName);

        return !gameList.includes(factory.game);
    }

    private filterOutTutorRowsFromOtherGames(learnsetTables: Template[]): Template[] {
        const tutorTable = this.getTutorTable(learnsetTables);
        if (tutorTable === undefined) {
            return learnsetTables;
        }
        const atkRowsParam = tutorTable.getParam('1');
        if (atkRowsParam === null) {
            throw new ParamNotFoundException('1', 'Atk-Table on ' + this.pkmnName);
        }
        const atkRows = atkRowsParam.templates;
        for (let i = 0; i < atkRows.length; i++) {
            const gamesParam = atkRows[i].getParam('1');
            if (gamesParam === null) {
                throw new ParamNotFoundException('1', 'Tutor Atk-Row on ' + this.pkmnName);
            }
            const atkRowGames = SkUtils.extractGamesFromSkParameter(gamesParam);
            if (!atkRowGames.includes(this.game)) {
                const atkRowIndex = atkRows[i].index;
                this.removeAtkRowFromParam(atkRowsParam, atkRowIndex);
                i--;
            }
        }

        return learnsetTables;
    }

    private getTutorTable(learnsetTables: Template[]): Template | undefined {
        return learnsetTables.find((table) => {
            const artParam = table.getParam('Art');
            if (artParam === null) {
                throw new ParamNotFoundException('Art', 'Atk-Row on ' + this.pkmnName);
            }
            return artParam.text.trim() === 'Lehrer';
        });
    }

    private instantiateLearnsetTables(learnsetTableTemplates: Template[]): LearnsetTable[] {
        const learnsetTables: LearnsetTable[] = [];

        for (const learnsetTableTemplate of learnsetTableTemplates) {
            learnsetTables.push(this.instantiateLearnsetTable(learnsetTableTemplate));
        }

        return learnsetTables;
    }

    /**
     * @throws ParamNotFoundException
     */
    private instantiateLearnsetTable(learnsetTableTemplate: Template): LearnsetTable {
        const learnsetType = this.extractLearnsetTypeFromLearnsetTableTemplate(learnsetTableTemplate);
        return new LearnsetTable(
            this.pkmnName,
            learnsetType,
            this.game,
            this.instantiateLearnsetRows(learnsetTableTemplate, learnsetType)
        );
    }

    /**
     * @throws ParamNotFoundException, UnexpectedParamValueException
     */
    private extractLearnsetTypeFromLearnsetTableTemplate(learnsetTableTemplate: Template): LearnsetType {
        const learnsetTypeParam = learnsetTableTemplate.getParam('Art');
        if (learnsetTypeParam === null) {
            throw new ParamNotFoundException('Art', 'Atk-Table of ' + this.pkmnName);
        }

        return GeneralUtils.validateLearnsetType(learnsetTypeParam.text);
    }

    /**
     * @throws ParamNotFoundException
     */
    private instantiateLearnsetRows(learnsetTableTemplate: Template, learnsetType: LearnsetType): LearnsetRow[] {
        const learnsetRows: LearnsetRow[] = [];

        const learnsetRowsParam = learnsetTableTemplate.getParam('1');
        if (learnsetRowsParam === null) {
            throw new ParamNotFoundException('first param', 'Atk-Table of ' + this.pkmnName);
        }
        const learnsetRowTemplates = learnsetRowsParam.templates;

        for (const learnsetRowTemplate of learnsetRowTemplates) {
            try {
                const learnsetRow = new LearnsetRow(learnsetRowTemplate, learnsetType);
                learnsetRows.push(learnsetRow);
            } catch (e) {
                Logger.elog('error in instantiating learnset row of ' + this.pkmnName + ': ' + e);
            }
        }

        return learnsetRows;
    }
}
