import { Bot, Parameter, Template } from 'mediawiki-bot';
import fs from 'fs';

import { LearnsetType } from '../types';
import { PkmnObj } from '../PkmnObj';
import { addLearnsetsToPkmn } from './normalforms';
import {
    handlePkmnWithSpecialForm,
    needsSpecialHandling,
} from './specialforms';
import {
    DATA_OUTPUT_DIR,
    MAIN_GAME_SK_LIST,
    NEWEST_GEN,
    OLDEST_GEN,
    SKIP_MAINGAME_SK_LIST,
} from '../constants';
import Logger from '../LogHandler';
/*
todo rotom event learnsets
*/

//!what to remember:
//gen 7 tutor moves of evoli and pikachu
//eF-eM

export let GEN = -1;
export const bot = new Bot(
    'shouldntbeneeded',
    'thisshouldntbeneeded',
    'https://www.pokewiki.de/api.php',
    true
);
export let dataMap = new Map<string, PkmnObj | string>();

const learnsetSubpagesCache = new Map<string, Template[]>();

/**
 * central function that creates the entire pkmn data set
 */
export default async function createDataSet() {
    Logger.initLogs(`createPkmnData`);
    const pkmnList = await bot.getCatMembers('Kategorie:Pokémon');

    //yes i know, originally this wasnt meant to do all gens at once
    for (GEN = OLDEST_GEN; GEN <= NEWEST_GEN; GEN++) {
        Logger.statusLog(`CREATING PKMN DATA OF GEN ${GEN}`);

        let skip = true;
        for (let page of pkmnList) {
            const pkmn = page.title;
            if (pkmn === 'Aalabyss') {
                skip = false;
            }
            if (skip) {
                Logger.statusLog(`skipping ${pkmn}`);
                continue;
            }

            if (needsSpecialHandling(pkmn)) {
                await handlePkmnWithSpecialForm(pkmn);
            } else {
                await addLearnsetsToPkmn(pkmn);
            }

            Logger.statusLog(pkmn + ' done');
        }

        fs.writeFileSync(
            DATA_OUTPUT_DIR + `/pkmnDataGen${GEN}.json`,
            JSON.stringify(Object.fromEntries(dataMap))
        );
    }
}

/**
 *
 * @param pkmnName
 * @returns filters and returns learnset tables of GEN
 */
export async function getTargetedGenLearnsets(
    pkmnName: string
): Promise<Template[]> {
    let learnsets: Template[];
    if (learnsetSubpagesCache.has(pkmnName)) {
        //Logger.statusLog(`learnsets are cached, getting from cache map`);
        const cachedLearnsets = learnsetSubpagesCache.get(pkmnName);
        if (cachedLearnsets === undefined) {
            Logger.elog(`cached learnsets of ${pkmnName} are undefined`);
            return [];
        }
        learnsets = cachedLearnsets;
    } else {
        //Logger.statusLog(`learnsets are not cached, getting from wiki`);
        learnsets = await bot.getTemplates(`${pkmnName}/Attacken`);
        //Logger.statusLog(`caching learnsets of ${pkmnName}`);
        learnsetSubpagesCache.set(pkmnName, learnsets);
    }

    const filteredLearnsets = learnsets.filter((item) => {
        const gParam = item.getParam('g');
        if (gParam === null) {
            //not an atk table template
            return false;
        }
        return item.title === 'Atk-Table' && Number(gParam.text) === GEN;
    });

    //Logger.statusLog(`got ${filteredLearnsets.length} filtered tables`);
    return filteredLearnsets;
}

/**
 * filters learnset tables of one learnset type
 * @param learnsetType
 * @param learnsets
 * @param pkmnName needed for error message
 * @returns
 */
export function getLearnsetTypeLearnsets(
    learnsetType: LearnsetType,
    learnsets: Template[],
    pkmnName: string
): Template[] {
    //Logger.statusLog(`filters out learnset tables of learnset type ${learnsetType}, pkmn: ${pkmnName}`);
    const filteredLearnsets = learnsets.filter((item) => {
        const artParam = item.getParam('Art');
        if (artParam === null) {
            Logger.elog(
                'getLearnsetTypeLearnsets: couldnt find art param in template of ' +
                    pkmnName
            );
            return false;
        }
        return artParam.text === learnsetType;
    });

    filterOutUnwantedLearnsetTables(filteredLearnsets);

    //Logger.statusLog(`got ${filteredLearnsets.length} filtered learnsets`);
    return filteredLearnsets;
}

/**
 * e. g. LGPE learnset tables should be left out
 */
function filterOutUnwantedLearnsetTables(learnsets: Template[]) {
    for (let i = 0; i < learnsets.length; i++) {
        const skParam = learnsets[i].getParam('sk');
        if (skParam === null) {
            //has no sks set
            continue;
        }
        const skTemplate = skParam.templates[0];
        if (isUnwantedSk(skTemplate)) {
            learnsets.splice(i, 1);
        }
    }
}

function isUnwantedSk(skTemplate: Template) {
    const skList = getSkParamValues(skTemplate);

    let unwantedCount = 0;
    for (let tableSk of skList) {
        if (SKIP_MAINGAME_SK_LIST.includes(tableSk)) {
            unwantedCount++;
        }
    }

    return unwantedCount > 0;
}

/**
 *
 * @returns array of all possible learnset types in the selected gen
 */
export function getLearnsetTypesList(): LearnsetType[] {
    //Logger.statusLog(`returning gen dependent list of learnset types (old gen excluded => no real type)`);
    const returnArr: LearnsetType[] = ['Zucht', 'Level', 'Lehrer', 'Event'];

    if (GEN >= 8) {
        returnArr.push('TMTP');
    } else {
        returnArr.push('TMVM');
    }

    //Logger.statusLog(`returning ${returnArr.join()}`);

    return returnArr;
}

export function atkRowHasOnlyNonMainGameSks(atkRow: Template): boolean {
    const gameParam = atkRow.getParam('Game');
    if (paramHasSkTemplate(gameParam)) {
        return skParamHasOnlyNonMainGameSks(gameParam);
    }
    const firstParam = atkRow.getParam('1');
    if (paramHasSkTemplate(firstParam)) {
        return skParamHasOnlyNonMainGameSks(firstParam);
    }
    return false;
}

function paramHasSkTemplate(param: Parameter | null): boolean {
    if (param === null) {
        return false;
    }
    if (param.templates.length <= 0) {
        return false;
    }
    const firstTemplate = param.templates[0];
    const templateIsSk = firstTemplate.title.toLowerCase() === 'sk';
    if (!templateIsSk) {
        return false;
    }
    if (param.text !== '##TEMPLATE:0##') {
        Logger.wlog(
            'paramHasSkTemplate: param has text next to a sk template ' + param
        );
    }
    return true;
}

/**
 * LGPE is considered a non maingame in this context because it doesn't have breeding
 */
function skParamHasOnlyNonMainGameSks(skParam: Parameter | null): boolean {
    if (skParam === null) {
        return false;
    }
    const skTemplate = skParam.templates[0];
    const skValues = getSkParamValues(skTemplate);

    for (const sk of skValues) {
        if (MAIN_GAME_SK_LIST.includes(sk)) {
            return false;
        }
    }

    return true;
}

function getSkParamValues(skTemplate: Template): string[] {
    const skList: string[] = [];

    let nextParam = skTemplate.getParam('1');
    for (let i = 2; nextParam !== null; i++) {
        skList.push(nextParam.text);
        nextParam = skTemplate.getParam(String(i));
    }

    return skList;
}

export function filterAtkTables(templates: Template[]) {
    return templates.filter((template) => {
        return template.title === 'Atk-Table';
    });
}
