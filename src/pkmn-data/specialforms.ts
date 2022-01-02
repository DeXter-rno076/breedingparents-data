import fs from 'fs';
import { Template, Section } from 'mediawiki-bot';

import {
    LearnsetType,
    PkmnWithSpecialformsIdentifiersData,
    PkmnWithSpecialFormsLearnsetExtractionData,
    SpecialformsIdentifiersData,
} from '../types';
import { PkmnObj } from '../PkmnObj';
import {
    GEN,
    bot,
    getLearnsetTypeLearnsets,
    getTargetedGenLearnsets,
    getLearnsetTypesList,
    dataMap,
    atkRowHasOnlyNonMainGameSks,
    filterAtkTables,
} from './createPkmndata';
import { addLearnset, createPkmnObj } from './normalforms';
import Logger from '../LogHandler';

const specialFormData = JSON.parse(
    fs.readFileSync('data/specialforms.json', { encoding: 'utf-8' })
) as PkmnWithSpecialformsIdentifiersData[];

const specialAtkRowFormSelectors = JSON.parse(
    fs.readFileSync('data/specialAtkRowFormSelectors.json', {
        encoding: 'utf-8',
    })
) as { [key: string]: string[] };

const sectionsCache = new Map<string, Section[]>();

/**
 * creates PkmnObj instances, adds data and adds them to dataMap of pkmn and its special forms
 * @param pkmnName pkmn name
 */
export async function handlePkmnWithSpecialForm(pkmnName: string) {
    //Logger.statusLog(`starting creating of PkmnObj instance for ${pkmnName} (with specialforms)`);
    let sections: Section[];
    if (sectionsCache.has(pkmnName)) {
        //Logger.statusLog(`sections of ${pkmnName} are cached, getting from cache`);
        const cachedSections = sectionsCache.get(pkmnName);
        if (cachedSections === undefined) {
            Logger.elog(`cached section of ${pkmnName} are undefined`);
            return;
        }
        sections = cachedSections;
    } else {
        //Logger.statusLog(`sections of ${pkmnName} are not cached, getting from wiki and caching`);
        sections = await bot.getSections(pkmnName + '/Attacken');
        sectionsCache.set(pkmnName, sections);
    }

    let genSectionCounter = 0;
    for (let section of sections) {
        if (section.line.includes(`${GEN}. Generation`)) {
            genSectionCounter++;
        }
    }
    //Logger.statusLog(`found ${genSectionCounter} sections for gen ${GEN}`);

    const learnsetExtractionData = await createPkmnWithSpecialFormsPkmnObjs(
        pkmnName
    );
    if (learnsetExtractionData === null) {
        //Logger.statusLog(`failed to create learnset extraction data for ${pkmnName}, skipping`);
        return;
    }

    if (genSectionCounter > 1) {
        //Logger.statusLog(`more than one gen section found for ${pkmnName} => handling special form with separated sections`);
        //Logger.statusLog(`adding learnset templates to extraction data for ${pkmnName}`);
        await addLearnsetsToExtractionData(
            pkmnName,
            sections,
            learnsetExtractionData
        );
        //Logger.statusLog(`adding learnsets to specialforms of ${pkmnName}`);
        handleSeparatedSections(learnsetExtractionData);
    } else {
        //Logger.statusLog(`only one gen section found for ${pkmnName} => handling special form with fused sections`);
        await handleFusedSection(learnsetExtractionData);
    }
}

/**
 * creates an array of learnset extraction data objects (consist of PkmnObj and text identifier data)
 * if the forms are separated in the learnsets article property learnsets will be added from a separate function
 * @param pkmnName
 * @returns PkmnWithSpecialFormsLearnsetExtractionData[] | null
 */
async function createPkmnWithSpecialFormsPkmnObjs(
    pkmnName: string
): Promise<PkmnWithSpecialFormsLearnsetExtractionData[] | null> {
    //Logger.statusLog(`creating learnset extraction data (i. e. PkmnObj instances + text identifier data)`);
    const pkmnObj = await createPkmnObj(pkmnName);
    if (pkmnObj === null) {
        Logger.elog(
            'createPkmnWithSpecialFormsPkmnObjs: error in creating pkmn obj of ' +
                pkmnName
        );
        return null;
    }
    //Logger.statusLog(`getting text identifier infos for ${pkmnName}`);
    const identifierInfo = getPkmnWithSpecialFormsIdentifiersInfo(pkmnName);
    if (identifierInfo === undefined) {
        Logger.elog(
            'createPkmnWithSpecialFormsPkmnObjs: no identifier data info found for ' +
                pkmnName
        );
        return null;
    }
    //Logger.statusLog(`creating PkmnObj instances for forms of ${pkmnName}`);
    const specialFormsObjs = createSpecialFormObjs(
        pkmnObj,
        identifierInfo.forms
    );

    //===============================================================================
    //Logger.statusLog(`creating learnset extraction data array`);//todo hint: this sounds like a separete function af
    //Logger.statusLog(`adding learnset extraction data of normal for of ${pkmnName} to return array`);
    const returnArr: PkmnWithSpecialFormsLearnsetExtractionData[] = [
        {
            pkmnObj,
            identifierInfo,
        },
    ];

    for (let i = 0; i < specialFormsObjs.length; i++) {
        const specialFormIdentifierInfo = identifierInfo.forms[i];
        if (specialFormIdentifierInfo === undefined) {
            Logger.elog(
                'createPkmnWithSpecialFormsPkmnObjs: too less identifier forms objs'
            );
        }

        //Logger.statusLog(`adding learnset extraction data to return array of ${specialFormsObjs[i].name}`)
        returnArr.push({
            pkmnObj: specialFormsObjs[i],
            identifierInfo: specialFormIdentifierInfo,
        });
    }

    //Logger.statusLog(`returning successfully created learnset extraction data of ${pkmnName}`);
    return returnArr;
}

/**
 * calls addLearnsets for every pkmn form
 * @param learnsetExtractionData
 */
function handleSeparatedSections(
    learnsetExtractionData: PkmnWithSpecialFormsLearnsetExtractionData[]
) {
    //Logger.statusLog(`handling separated sections`);
    for (let pkmnLearnsetDataObj of learnsetExtractionData) {
        if (pkmnLearnsetDataObj.learnsets === undefined) {
            Logger.elog(
                'handleSeparatedSections: learnsets property of learnset ' +
                    'extraction data obj for separeted sections is undefined: ' +
                    pkmnLearnsetDataObj.identifierInfo.name.de
            );
            continue;
        }

        for (let learnsetType of getLearnsetTypesList()) {
            addLearnset(
                pkmnLearnsetDataObj.pkmnObj,
                pkmnLearnsetDataObj.learnsets,
                learnsetType
            );
        }

        dataMap.set(
            pkmnLearnsetDataObj.pkmnObj.name,
            pkmnLearnsetDataObj.pkmnObj
        );
    }
}

/**
 * adds learnsets of each form to learnset extraction data array
 * @param pkmnName
 * @param sections learnset subpage sections array
 * @param learnsetExtractionData array of learnset extraction data objs (contain PkmnObj instance and text identifier data)
 */
async function addLearnsetsToExtractionData(
    pkmnName: string,
    sections: Section[],
    learnsetExtractionData: PkmnWithSpecialFormsLearnsetExtractionData[]
) {
    //Logger.statusLog(`adding learnsets to extraction data of ${pkmnName}`);
    for (let pkmnForm of learnsetExtractionData) {
        //Logger.statusLog(`adding learnsets to form ${pkmnForm}`);
        const pkmnSectionId = getSectionId(sections, pkmnForm.identifierInfo);
        if (pkmnSectionId === null) {
            Logger.elog(
                'addLearnsetsToExtractionData: no section found for ' +
                    pkmnForm.pkmnObj.name
            );
            continue;
        }

        //section separated forms are so few that this isn't cached
        let pkmnTemplates = await bot.getTemplates(
            pkmnName + '/Attacken',
            pkmnSectionId
        );

        pkmnTemplates = filterAtkTables(pkmnTemplates);

        pkmnForm.learnsets = pkmnTemplates;
    }
}

/**
 * creates PkmnObj instances for special forms based on their normal form's obj
 * @param pkmnObj obj of the normal form
 * @param specialFormsDataArr identifier data array of the special forms
 */
function createSpecialFormObjs(
    pkmnObj: PkmnObj,
    specialFormsDataArr: SpecialformsIdentifiersData[]
): PkmnObj[] {
    //Logger.statusLog(`creating pkmn objs for special forms of ${pkmnObj.name}`);
    const returnArr: PkmnObj[] = [];
    for (let specialFormDataObj of specialFormsDataArr) {
        const name = specialFormDataObj.name.de;
        //Logger.statusLog(`creating pkmn obj of ${name}`);
        const id = specialFormDataObj.nr;

        const eggGroups = [];
        if (pkmnObj.eggGroup1 !== undefined) {
            eggGroups.push(pkmnObj.eggGroup1);
        } else {
            Logger.elog(`pkmn ${pkmnObj.name} has no first egg group set`);
            continue;
        }
        if (pkmnObj.eggGroup2 !== undefined) {
            eggGroups.push(pkmnObj.eggGroup2);
        }

        if (pkmnObj.gender === undefined) {
            Logger.elog(
                'createSpecialFormObjs: gender attribute of pkmnObj is undefined for ' +
                    pkmnObj.name
            );
            continue;
        }
        const gender = pkmnObj.gender;

        const specialFormObj = new PkmnObj(
            name,
            id,
            eggGroups[0],
            eggGroups[1],
            gender
        );

        returnArr.push(specialFormObj);
    }

    return returnArr;
}

/**
 *
 * @param sections sections array of the pkmn's learnsets subpage
 * @param identifierData identifier data obj of the current pkmn (can be a special form)
 * @returns numeric index of the current pkmn's section
 */
function getSectionId(
    sections: Section[],
    identifierData:
        | PkmnWithSpecialformsIdentifiersData
        | SpecialformsIdentifiersData
): number | null {
    //Logger.statusLog(`determinating sectiod id of pkmn form`);
    let sectionTitle = GEN + '. Generation';
    const textIdentifier = identifierData.text_identifier['g' + GEN];
    if (textIdentifier !== '') {
        sectionTitle += ` (${textIdentifier})`;
    }
    //Logger.statusLog(`got section title ${sectionTitle}`);

    for (let section of sections) {
        if (section.line === sectionTitle) {
            const sectionIndex = Number(section.index);
            if (isNaN(sectionIndex)) {
                Logger.elog(
                    'getSectionId: section index was not a number: ' +
                        JSON.stringify(section)
                );
                return null;
            }
            //Logger.statusLog(`found section at index ${sectionIndex}`);
            return sectionIndex;
        }
    }
    Logger.elog(
        `getSectionId: couldnt find section ${sectionTitle} in ${JSON.stringify(
            sections
        )}`
    );
    return null;
}

/**
 * adds learnsets to pkmn forms with fused learnset sections
 * @param learnsetExtractionData
 */
async function handleFusedSection(
    learnsetExtractionData: PkmnWithSpecialFormsLearnsetExtractionData[]
) {
    //Logger.statusLog(`adding learnsets of a fused section`);

    const normalForm = learnsetExtractionData[0].pkmnObj;
    const targetedLearnsets = await getTargetedGenLearnsets(normalForm.name);
    const formSeparatorsSelector = createFormSeparatorSelector(
        learnsetExtractionData
    );

    for (let learnsetType of getLearnsetTypesList()) {
        fusedSections_addLearnsettypeLearnsets(
            targetedLearnsets,
            formSeparatorsSelector,
            learnsetType,
            normalForm.name
        );
    }

    for (let pkmnExtractionDataObj of learnsetExtractionData) {
        dataMap.set(
            pkmnExtractionDataObj.pkmnObj.name,
            pkmnExtractionDataObj.pkmnObj
        );
    }
}

/**
 * creates map with pairs of text identifiers and pkmn objs of the pkmn forms for handleFusedSections()
 * in adding learnsets the pkmn forms (normal and special) are selected via this map
 * but this is just a selection structure, in the end the json data is created via learnsetExtractionData
 * @param learnsetExtractionData
 * @returns
 */
function createFormSeparatorSelector(
    learnsetExtractionData: PkmnWithSpecialFormsLearnsetExtractionData[]
): Map<string, PkmnObj> {
    //Logger.statusLog(`creating form separators map of ${learnsetExtractionData[0].pkmnObj.name}`);
    const returnMap = new Map<string, PkmnObj>();
    for (let obj of learnsetExtractionData) {
        //Logger.statusLog(`adding separator selector of ${obj.pkmnObj.name}`);
        const textIdentifier = obj.identifierInfo.text_identifier['g' + GEN];
        if (textIdentifier === undefined) {
            Logger.wlog(
                `createFormSeparatorSelector: couldnt find gen ${GEN} text identifier of ${obj.pkmnObj.name}` +
                    ` (if this form doesn't appear in this gen, this is intended)`
            );
            continue;
        }
        returnMap.set(textIdentifier, obj.pkmnObj);
    }

    return returnMap;
}

function fusedSections_addLearnsettypeLearnsets(
    learnsets: Template[],
    formSeparatorsSelector: Map<string, PkmnObj>,
    learnsetType: LearnsetType,
    pkmnName: string
) {
    //Logger.statusLog(`adding learnsets of type ${learnsetType} of forms of pkmn ${pkmnName}`);
    const learnTypeLearnsets = getLearnsetTypeLearnsets(
        learnsetType,
        learnsets,
        pkmnName
    );

    for (let learnsetTable of learnTypeLearnsets) {
        const atkRowsParam = learnsetTable.getParam('1');
        if (atkRowsParam === null) {
            Logger.elog(
                'handleFusedSection: couldnt find atk rows param of learnset table of: ' +
                    pkmnName
            );
            continue;
        }
        for (let atkRow of atkRowsParam.templates) {
            fusedSections_addMove(
                atkRow,
                formSeparatorsSelector,
                learnsetType,
                pkmnName
            );
        }
    }
}

function fusedSections_addMove(
    atkRow: Template,
    formSeparatorsSelector: Map<string, PkmnObj>,
    learnsetType: LearnsetType,
    pkmnName: string
) {
    if (atkRowHasOnlyNonMainGameSks(atkRow)) {
        return;
    }

    const moveNameParam = atkRow.getParam('2');
    if (moveNameParam === null) {
        Logger.elog(
            'handleFusedSection: couldnt find move name in learnset table of ' +
                pkmnName
        );
        return;
    }
    const moveName = moveNameParam.text;
    //Logger.statusLog(`adding move ${moveName} to forms of ${pkmnName}`);

    //todo separete this into two tmethods
    const extraParam = atkRow.getParam('Extra');
    const gameParam = atkRow.getParam('Game');
    if (extraParam === null && gameParam === null) {
        //Logger.statusLog(`move has no form selector set => adding to every form`);
        formSeparatorsSelector.forEach((value) => {
            value.addLearnset(learnsetType, moveName);
        });
        return;
    }

    let formSelectors: string[] = [];
    if (gameParam !== null) {
        const potGameParamSelectors =
            specialAtkRowFormSelectors[gameParam.text];
        if (potGameParamSelectors !== undefined) {
            formSelectors = potGameParamSelectors;
        }
    }
    if (formSelectors.length === 0 && extraParam !== null) {
        formSelectors.push(extraParam.text);
    }

    //Logger.statusLog(`move has form selector set => adding to certain forms`);
    for (let formSelector of formSelectors) {
        const targetedSpecialForm = formSeparatorsSelector.get(formSelector);
        if (targetedSpecialForm === undefined) {
            Logger.elog(
                'handleFusedSection: unknown form separator: ' +
                    formSelector +
                    ' in ' +
                    pkmnName
            );
            return;
        }
        targetedSpecialForm.addLearnset(learnsetType, moveName);
    }
}

/**
 *
 * @param normalFormName
 * @returns identifier data obj of normalFormName or undefined
 */
function getPkmnWithSpecialFormsIdentifiersInfo(
    normalFormName: string
): PkmnWithSpecialformsIdentifiersData | undefined {
    //Logger.statusLog(`retrieving specialformsidentifier data obj of ${normalFormName}`);
    return specialFormData.find((item) => {
        return item.name.de === normalFormName;
    });
}

/**
 *
 * @param pkmnName
 * @returns wether pkmn has special forms
 */
export function needsSpecialHandling(pkmnName: string): boolean {
    //Logger.statusLog(`checking whether ${pkmnName} needs special handling`);
    let textIdentifierData: PkmnWithSpecialformsIdentifiersData | null = null;
    for (let specialFormObj of specialFormData) {
        if (specialFormObj.name.de === pkmnName) {
            textIdentifierData = specialFormObj;
        }
    }
    if (textIdentifierData === null) {
        //Logger.statusLog(`${pkmnName} does not need special handling`);
        return false;
    }
    if (
        textIdentifierData.no_differences_gens !== undefined &&
        textIdentifierData.no_differences_gens.includes(GEN)
    ) {
        //Logger.statusLog(`${pkmnName} does not need special handling`);
        return false;
    }

    if (textIdentifierData.text_identifier['g' + GEN] === undefined) {
        //special forms of the pkmn don't exist in this gen yet
        return false;
    }
    //Logger.statusLog(`${pkmnName} needs special handling`);
    return true;
}
