import { Template } from 'mediawiki-bot';
import { SpecialAtkRowFormSelectorsUtils } from '../external_data_utils/SpecialAtkRowFormSelectorsUtils';
import Logger from '../Logger';
import { SkUtils } from '../SkUtils';
import { LearnsetType } from '../types';
import { ParamNotFoundException } from './exceptions/ParamNotFoundException';
import { UnexpectedParamValueException } from './exceptions/UnexpectedParamValueException';

export class LearnsetRow {
    public readonly moveName: string;
    public readonly learnsetType: LearnsetType;
    public readonly gen: number;
    public readonly specificGames: string[];
    public readonly specificForms: string[];

    /**
     * @throws ParamNotFoundException, UnexpectedParamValueException
     */
    public constructor(atkRowTemplate: Template, learnsetType: LearnsetType) {
        this.learnsetType = learnsetType;
        this.moveName = this.extractMoveName(atkRowTemplate);
        this.gen = this.extractGenNumber(atkRowTemplate);
        this.specificGames = this.extractSpecificGames(atkRowTemplate);
        this.specificForms = this.extractSpecificForms(atkRowTemplate);
    }

    /**
     * @throws ParamNotFoundException
     */
    private extractMoveName(atkRowTemplate: Template): string {
        const moveNameParam = atkRowTemplate.getParam('2');
        if (moveNameParam === null) {
            throw new ParamNotFoundException('name', 'AtkRow');
        }
        return this.replaceHTMLEntities(moveNameParam.text);
    }

    private replaceHTMLEntities(name: string): string {
        const htmlEntities = {
            '&nbsp;': ' ',
        };
        for (const [k, v] of Object.entries(htmlEntities)) {
            name = name.replace(new RegExp(k, 'g'), v);
        }
        return name;
    }

    /**
     * @throws ParamNotFoundException, UnexpectedParamValueException
     */
    private extractGenNumber(atkRowTemplate: Template): number {
        const genNumberParam = atkRowTemplate.getParam('G');
        if (genNumberParam === null) {
            Logger.elog('atk row template has no gen param set');
            throw new ParamNotFoundException('G', 'AtkRow of move ' + this.moveName);
        }
        const genNumber = Number(genNumberParam.text);
        if (isNaN(genNumber)) {
            Logger.elog('atk row template has no number as gen value');
            throw new UnexpectedParamValueException(genNumberParam.text, 'gen number', 'AtkRow');
        }
        return genNumber;
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private extractSpecificGames(atkRowTemplate: Template): string[] {
        const gameParam = atkRowTemplate.getParam('Game');
        if (gameParam === null || gameParam.templates.length === 0) {
            return [];
        }

        return SkUtils.extractGamesFromSkParameter(gameParam);
    }

    /**
     * @throws UnexpectedParamValueException
     */
    private extractSpecificForms(atkRowTemplate: Template): string[] {
        const gameParam = atkRowTemplate.getParam('Game');
        const extraParam = atkRowTemplate.getParam('Extra');
        if (extraParam === null && gameParam === null) {
            return [];
        }
        if (extraParam !== null && gameParam !== null) {
            throw new UnexpectedParamValueException('both Extra and Game set', 'only one of them', '');
        }

        let formIdentifier = '';
        if (extraParam !== null) {
            formIdentifier = extraParam.text.trim();
        } else {
            formIdentifier = gameParam.text.trim();
        }

        if (SpecialAtkRowFormSelectorsUtils.isSpecialAtkRowFormSelector(formIdentifier)) {
            return SpecialAtkRowFormSelectorsUtils.getFormsForSpecialAtkRowFormSelector(formIdentifier);
        }
        return [formIdentifier];
    }

    public hasSpecificGame(): boolean {
        return this.specificGames.length > 0;
    }

    public hasSpecificForm(): boolean {
        return this.specificForms.length > 0;
    }
}
