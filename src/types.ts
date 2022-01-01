import { Template } from 'mediawiki-bot';
import { PkmnObj } from './PkmnObj';

export type PkmnGender = 'unknown' | 'both' | 'male' | 'female';
export type LearnsetType =
    | 'Level'
    | 'TMTP'
    | 'TMVM'
    | 'Zucht'
    | 'Lehrer'
    | 'Event';

export interface PkmnWithSpecialformsIdentifiersData {
    name: {
        de: string;
    };
    text_identifier: {
        [key: string]: string;
    };
    no_differences_gens?: number[];
    forms: SpecialformsIdentifiersData[];
}

export interface SpecialformsIdentifiersData {
    name: {
        de: string;
    };
    nr: string;
    text_identifier: {
        [key: string]: string;
    };
}

export interface PkmnWithSpecialFormsLearnsetExtractionData {
    pkmnObj: PkmnObj;
    identifierInfo:
        | PkmnWithSpecialformsIdentifiersData
        | SpecialformsIdentifiersData;
    learnsets?: Template[];
}

export interface EvolutionsData {
    pre: string;
    name: string;
    post: string;
}

export interface PkmnDataJSONObj {
    [keys: string]: PkmnObj;
}

export interface MoveRenamingInfo {
    oldNames: string[];
    currentName: string;
}
