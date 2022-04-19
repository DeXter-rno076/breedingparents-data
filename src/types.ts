import { GAME_SK_ALIASES } from './constants';
import { TunedPkmnJSON } from './pkmn-data_adjustements/TunedPkmnJSON';
import { AdjustedPkmnJSON } from './pkmn-data_adjustements/AdjustedPkmnJSON';

export type Game =
    | 'R'
    | 'B'
    | 'Ge'
    | 'Go'
    | 'Si'
    | 'K'
    | 'RU'
    | 'SA'
    | 'SM'
    | 'FR'
    | 'BG'
    | 'D'
    | 'P'
    | 'PT'
    | 'HG'
    | 'SS'
    | 'Sc'
    | 'W'
    | 'S2'
    | 'W2'
    | 'X'
    | 'Y'
    | 'OR'
    | 'AS'
    | 'So'
    | 'M'
    | 'US'
    | 'UM'
    | 'LGP'
    | 'LGE'
    | 'SW'
    | 'SH'
    | 'SWEX'
    | 'SHEX'
    | 'SD'
    | 'LP'
    | 'PLA'
    | 'KA'
    | 'PU';

export type GameAlias = keyof typeof GAME_SK_ALIASES;

export type PkmnGender = 'unknown' | 'both' | 'male' | 'female';

export type LearnsetType =
    | 'Level'
    | 'TMTP'
    | 'TMVM'
    | 'Zucht'
    | 'Lehrer'
    | 'Event'
    | 'Kampfexklusiv'
    | 'Meisterung'
    | 'Entwicklung';

export interface PkmnEvolutionLink {
    pre: string;
    name: string;
    post: string;
}

export type PkmnEvolutions = Map<string, PkmnEvolutionLink>;

export interface MoveRenamingInfo {
    oldNames: string[];
    currentName: string;
}

export interface AdjustedPkmnDataset {
    [key: string]: AdjustedPkmnJSON;
}

export interface PlainPkmnDataset {
    [key: string]: TunedPkmnJSON;
}

//todo not happy with names and de facto duplicate types
export interface PkmnWithSpecialformsIdentifiersData {
    name: string;
    text_identifier: Map<Game, string>;
    doesnt_exist_in: Game[];
    forms: Map<string, SpecialformsIdentifiersData>;
}

export interface SpecialformsIdentifiersData {
    name: string;
    nr: string;
    doesnt_exist_in: Game[];
    text_identifier: Map<Game, string>;
}
