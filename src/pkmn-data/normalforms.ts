import { Template } from 'mediawiki-bot';

import {
    bot,
    GEN,
    dataMap,
    getTargetedGenLearnsets,
    getLearnsetTypesList,
    getLearnsetTypeLearnsets,
    atkRowHasOnlyNonMainGameSks,
} from './createPkmndata';
import { LearnsetType } from '../types';
import { PkmnObj } from '../PkmnObj';
import Logger from '../LogHandler';

const pkmnInfoboxCache = new Map<string, Template>();

/**
 * creates PkmnObj, adds learnsets and the obj to dataMap for a pkmn that has no special forms
 * @param pkmnName
 */
export async function addLearnsetsToPkmn(pkmnName: string) {
    //Logger.statusLog(`starting pkmn obj creation of normal pkmn ${pkmnName}`);
    const pkmnObj = await createPkmnObj(pkmnName);
    if (pkmnObj === null) {
        Logger.elog(
            'handlePkmn: error occured in creating object of ' + pkmnName
        );
        return;
    }

    const available = await addLearnsets(pkmnName, pkmnObj);
    if (!available) {
        //Logger.statusLog(`skipping because ${pkmnName} is not in gen ${GEN}`);
        return;
    }

    //Logger.statusLog(`adding ${pkmnName} pkmnobj to data map`);
    dataMap.set(pkmnObj.name, pkmnObj);
}

/**
 * gets the learnsets templates and adds the data to pkmnObj
 * @param pkmnName
 * @param pkmnObj
 */
async function addLearnsets(pkmnName: string, pkmnObj: PkmnObj) {
    //Logger.statusLog(`adding learnsets to ${pkmnName}`);
    const targetedLearnsets = await getTargetedGenLearnsets(pkmnName);

    if (targetedLearnsets.length === 0) {
        //Logger.statusLog(`no gen learnsets found for ${pkmnName}`);
        return false;
    }

    //Logger.statusLog(`adding each learnset to ${pkmnName}`);
    for (let learnsetType of getLearnsetTypesList()) {
        addLearnset(pkmnObj, targetedLearnsets, learnsetType);
    }

    return true;
}

/**
 * filters templates for targeted learnsetType and adds their data to pkmnObj
 * @param pkmnObj
 * @param learnsets learnset templates (includes all learnset types)
 * @param learnsetType currently looked at learnsetType
 */
export function addLearnset(
    pkmnObj: PkmnObj,
    learnsets: Template[],
    learnsetType: LearnsetType
) {
    //Logger.statusLog(`adding learnset type ${learnsetType} to ${pkmnObj.name}`);
    const tables = getLearnsetTypeLearnsets(
        learnsetType,
        learnsets,
        pkmnObj.name
    );
    if (tables.length === 0) {
        //Logger.statusLog(`no learnsets found for ${learnsetType}`);
        return;
    }

    for (let table of tables) {
        addLearnsetsOfLearnsettable(table, pkmnObj, learnsetType);
    }
}

/**
 * todo separate this
 * adds learnset data of one single learnset table to pkmnObj
 * @param template learnset table template
 * @param pkmnObj
 * @param learnsetType
 */
function addLearnsetsOfLearnsettable(
    template: Template,
    pkmnObj: PkmnObj,
    learnsetType: LearnsetType
) {
    //Logger.statusLog(`adding ${learnsetType} table to ${pkmnObj.name}`);
    const firstParam = template.getParam('1');
    if (firstParam === null) {
        Logger.elog(
            'handleLearnsetTable: couldnt find first param of AtkTable of ' +
                pkmnObj.name
        );
        return;
    }
    const atkRows = firstParam.templates;

    for (let row of atkRows) {
        //Logger.statusLog(`extracting data of row ${row.toString()}`);
        if (atkRowHasOnlyNonMainGameSks(row)) {
            /* Logger.statusLog(
                `skipping tutor moves from irrelevant games (e. g. XD)`
            ); */
            continue;
        }

        const secondParam = row.getParam('2');
        if (secondParam === null) {
            Logger.elog(
                'handleLearnsetTable: couldnt find second param of AtkRow of ' +
                    pkmnObj.name
            );
            return;
        }
        const moveName = secondParam.text;

        if (moveName.includes('{')) {
            Logger.elog(
                'handleLearnsetTable: { in name of ' +
                    moveName +
                    ' in ' +
                    learnsetType +
                    ' moves of ' +
                    pkmnObj.name +
                    ' detected'
            );
        }

        /* Logger.statusLog(
            `adding ${moveName} to ${learnsetType} moves of ${pkmnObj.name}`
        ); */
        pkmnObj.addLearnset(learnsetType, moveName);
    }
}

/**
 * creates instance of PkmnObj and sets all data except for learnsets
 * @param pkmn pkmn name
 * @returns pkmn obj or null if something went wrong
 */
export async function createPkmnObj(pkmn: string): Promise<PkmnObj | null> {
    //Logger.statusLog(`creating a PkmnObj instance for ${pkmn}`);
    const pkmnInfobox = await getPkmnInfobox(pkmn);
    if (pkmnInfobox === null) {
        /* Logger.statusLog(
            `skipping, couldn\'t find an infobox template for ${pkmn}`
        ); */
        return null;
    }

    const pkmnObj = instantiatePkmnObj(pkmn, pkmnInfobox);
    if (pkmnObj === null) {
        /* Logger.statusLog(
            `instantiating PkmnObj instance for ${pkmn} failed, skipping`
        ); */
        return null;
    }

    const setGenderResult = setGender(pkmnObj, pkmnInfobox);
    if (setGenderResult === 'failed') {
        //Logger.statusLog(`setting gender info for ${pkmn} failed, skipping`);
        return null;
    }

    setEggGroups(pkmnObj, pkmnInfobox);

    /* Logger.statusLog(
        `returning successfully created PkmnObj instance for ${pkmn}`
    ); */
    return pkmnObj;
}

/**
 * retrieves pkmn infobox for getting data needed for instantiating pkmnObj
 * @param pkmnName pkmn name
 * @returns Template or null if something went wrong
 */
async function getPkmnInfobox(pkmnName: string): Promise<Template | null> {
    //Logger.statusLog(`retrieving pkmn infobox template of ${pkmnName}`);
    let pkmnInfobox: Template | undefined;
    if (pkmnInfoboxCache.has(pkmnName)) {
        //Logger.statusLog(`infobox of ${pkmnName} is cached, getting from cache`);
        const cachedInfobox = pkmnInfoboxCache.get(pkmnName);
        if (cachedInfobox === undefined) {
            Logger.elog(`cached infobox of ${pkmnName} is undefined`);
            pkmnInfobox = undefined;
        }
        pkmnInfobox = cachedInfobox;
    } else {
        //Logger.statusLog(`infobox of ${pkmnName} is not cached, getting from wiki`);
        const mainPageTemplates = await bot.getTemplates(pkmnName);

        pkmnInfobox = mainPageTemplates.find((item) => {
            return item.title === 'Infobox Pokémon';
        });

        if (pkmnInfobox !== undefined) {
            //Logger.statusLog(`found infobox of ${pkmnName}, caching`)
            pkmnInfoboxCache.set(pkmnName, pkmnInfobox);
        }
    }

    if (pkmnInfobox === undefined) {
        Logger.elog('getPkmnInfobox: no infobox found for: ' + pkmnName);
        return null;
    }

    //Logger.statusLog(`returning successfully retrieved infobox template`);
    return pkmnInfobox;
}

/**
 * creates instance of PkmnObj (i. e. gets and sets data needed for constructor)
 * @param pkmn pkmn name
 * @param infobox infobox template of pkmn
 * @returns PkmnObj or null
 */
function instantiatePkmnObj(pkmn: string, infobox: Template): PkmnObj | null {
    /*  Logger.statusLog(
        `instantiating PkmnObj instance for ${pkmn} with infobox data`
    ); */
    const nrParam = infobox.getParam('Nr');
    if (nrParam === null) {
        Logger.elog(
            'instantiatePkmnObj: couldnt find Nr param in pkmn infobox of ' +
                pkmn
        );
        return null;
    }
    const pkmnId = nrParam.text;

    /* Logger.statusLog(
        `returning successfully created PkmnObj instance for ${pkmn}`
    ); */
    return new PkmnObj(pkmn, pkmnId);
}

/**
 * determines and sets gender on pkmnObj
 * @param pkmnObj PkmnObj instance of the current pkmn
 * @param pkmnInfobox infobox template of the current pkmn
 * @returns 'succeeded' or 'failed'
 */
function setGender(
    pkmnObj: PkmnObj,
    pkmnInfobox: Template
): 'succeeded' | 'failed' {
    //Logger.statusLog(`setting gender data of ${pkmnObj.name}`);
    const genderParam = pkmnInfobox.getParam('Geschlecht');
    if (genderParam === null) {
        Logger.elog('setGender: gender param not set for: ' + pkmnObj.name);
        return 'failed';
    }
    const genderInfo = genderParam.text;

    if (genderInfo.includes('Unbekannt')) {
        //Logger.statusLog(`setting gender unknown for ${pkmnObj.name}`);
        pkmnObj.setGender('unknown');
        return 'succeeded';
    }

    if (!/100\s*%/.test(genderInfo)) {
        //Logger.statusLog(`setting gender both for ${pkmnObj.name}`);
        pkmnObj.setGender('both');
        return 'succeeded';
    }

    const onlyGenderRegexRes = /.*100\s*%\s*(\S)/.exec(genderInfo);
    if (onlyGenderRegexRes === null) {
        Logger.elog('setGender: regex couldnt find single gender');
        return 'failed';
    }
    const singleGender = onlyGenderRegexRes[1];
    if (singleGender === '♀') {
        //Logger.statusLog(`setting gender female for ${pkmnObj.name}`);
        pkmnObj.setGender('female');
        return 'succeeded';
    }
    if (singleGender === '♂') {
        //Logger.statusLog(`setting gender male for ${pkmnObj.name}`);
        pkmnObj.setGender('male');
        return 'succeeded';
    }
    Logger.elog(
        `setGender: unknown symbol ${singleGender} in gender data of ${pkmnObj.name}`
    );
    return 'failed';
}

function setEggGroups(pkmnObj: PkmnObj, infobox: Template) {
    //Logger.statusLog(`setting egg groups for ${pkmnObj.name}`);
    const eggGroup1Param = infobox.getParam('Ei-Gruppe');
    const eggGroup1ChangesParam = infobox.getParam('Ei-Gruppenänderung');
    const eggGroup2Param = infobox.getParam('Ei-Gruppe2');
    const eggGroup2ChangesParam = infobox.getParam('Ei-Gruppenänderung2');

    if (eggGroup1Param === null) {
        Logger.elog(`setEggGroups: egg group 1 missing in ${pkmnObj.name}`);
        return;
    }
    if (eggGroup1ChangesParam !== null) {
        if (Number(eggGroup1ChangesParam.text) <= GEN) {
            /* Logger.statusLog(
                `setting ${eggGroup1Param.text} as egg group 1 for ${pkmnObj.name} with past egg group changes`
            ); */
            pkmnObj.setEggGroup(eggGroup1Param.text);
        }
    } else {
        /* Logger.statusLog(
            `setting ${eggGroup1Param.text} es egg group 1 for ${pkmnObj.name}`
        ); */
        pkmnObj.setEggGroup(eggGroup1Param.text);
    }

    if (eggGroup2ChangesParam !== null) {
        if (Number(eggGroup2ChangesParam.text) <= GEN) {
            if (eggGroup2Param === null) {
                Logger.elog(
                    `setEggGroups: egg group 2 missing in ${pkmnObj.name}`
                );
                return;
            }
            /* Logger.statusLog(
                `setting ${eggGroup2Param.text} as egg group 2 for ${pkmnObj.name} with past egg group changes`
            ); */
            pkmnObj.setEggGroup(eggGroup2Param.text);
        }
    } else {
        if (eggGroup2Param !== null) {
            /* Logger.statusLog(
                `setting ${eggGroup2Param.text} as egg group 2 for ${pkmnObj.name}`
            ); */
            pkmnObj.setEggGroup(eggGroup2Param.text);
        }
    }

    if (pkmnObj.eggGroup1 === undefined && pkmnObj.eggGroup2 === undefined) {
        Logger.elog(
            `setEggGroups: both egg groups appear to be added in later gen(s): ${pkmnObj.name}`
        );
    }
}
