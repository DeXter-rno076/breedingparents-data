import { UnexpectedParamValueException } from './initial_pkmn-data/exceptions/UnexpectedParamValueException';
import { Parameter, Template } from 'mediawiki-bot';
import { GAME_SK_LIST, GAME_SK_ALIASES } from './constants';
import Logger from './Logger';

export abstract class SkUtils {
    /**
     * @throws UnexpectedParamValueException
     */
    public static extractGamesFromSkParameter(skParam: Parameter, pageName = ''): string[] {
        const paramTemplates = skParam.templates;

        if (paramTemplates.length !== 1 || paramTemplates[0].title.toLowerCase() !== 'sk') {
            throw new UnexpectedParamValueException(skParam.toString(), 'one sk template', pageName);
        }

        const skTemplate = paramTemplates[0];
        return SkUtils.extractGamesFromSkTemplate(skTemplate);
    }

    //todo mixes abstraction layers
    public static extractGamesFromSkTemplate(skTemplate: Template): string[] {
        const skValues: string[] = [];
        for (const param of skTemplate.params) {
            let game = param.text;
            if (game === 'SWEX') {
                game = 'SW';
            } else if (game === 'SHEX') {
                game = 'SH';
            }

            if (!GAME_SK_LIST.includes(game) && GAME_SK_ALIASES[game] === undefined) {
                Logger.elog('sk template has a non game sk as a value: ' + game);
                continue;
            }

            if (GAME_SK_ALIASES[game] !== undefined) {
                game = GAME_SK_ALIASES[game];
            }
            skValues.push(game);
        }

        return skValues;
    }
}
