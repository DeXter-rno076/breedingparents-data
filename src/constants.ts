import { Game, GameAlias, LearnsetType } from './types';

/**
 * rough length limit of the formatted JSON object
 * formatting about doubles the length and mediawiki does it automatically
 * => unformatted JSON files will have about half the size of this value
 * if you have custom max page sizes and they're enough, just set the constant to something like 9999999999999
 * 600_000 should be sufficient for default mediawiki config
 */
export const MAX_FILE_LENGTH = 550_000;

//FILE PATHS =========================================
export const DATA_DIR = 'data';

export const DATA_IN_DIR = 'data/in';
export const DATA_OUT_DIR = 'data/out';

export const LOG_DIR = DATA_OUT_DIR + '/logs';
export const E_LOG_PATH = LOG_DIR + '/errorlog.txt';
export const WARNING_LOG_PATH = LOG_DIR + '/warninglog.txt';
export const STATUS_LOG_PATH = LOG_DIR + '/statuslog.txt';

export const PLAIN_DATASET_FILES_DIR = DATA_OUT_DIR + '/plain_gen_datasets';
export const PLAIN_DATASET_FILES_PKMN_DIR = PLAIN_DATASET_FILES_DIR + '/pkmn';
export const FINAL_DATASETS_DIR = DATA_OUT_DIR + '/final_datasets';
export const SPLIT_FINAL_DATASETS_DIR = DATA_OUT_DIR + '/split_final_datasets';
//====================================================

export const OLDEST_GEN = 2;
export const LEARNSET_SUBPAGE_SUFFIX = '/Attacken';

//!↓↓↓↓↓↓↓↓↓↓↓↓↓ HAS TO BE UPDATED ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
export const NEWEST_GEN = 8;

//todo maybe load dynamically from json file
//todo has TS something like type = element of ...? (this is redundant to type Game)
export const GAME_SK_LIST = [
    'R',
    'B',
    'Ge',
    'Go',
    'Si',
    'K',
    'RU',
    'SA',
    'SM',
    'XD',
    'COL',
    'FR',
    'BG',
    'D',
    'P',
    'PT',
    'HG',
    'SS',
    'Sc',
    'W',
    'S2',
    'W2',
    'X',
    'Y',
    'OR',
    'AS',
    'So',
    'M',
    'US',
    'UM',
    'LGP',
    'LGE',
    'SW',
    'SH',
    'SWEX',
    'SHEX',
    'SD',
    'LP',
    'PLA',
    'KA',
    'PU',
];

export const BLOCKED_GAME_SK_LIST = ['XD', 'COL'];

export const GAME_SK_ALIASES = {
    G: 'Go',
    Gold: 'Go',
    Silber: 'Si',
    Kristall: 'K',
    Ru: 'RU',
    Sa: 'SA',
    Sm: 'SM',
    Smaragd: 'SM',
    Diamant: 'D',
    Perl: 'P',
    Platin: 'PT',
    HeartGold: 'HG',
    SoulSilver: 'SS',
    Schwarz: 'Sc',
    S: 'Sc',
    Weiß: 'W',
    ΩR: 'OR',
    αS: 'AS',
    Mo: 'M',
    MO: 'M',
    SO: 'So',
    Schwert: 'SW',
    Schild: 'SH',
};

export const LEARNSET_TYPES: LearnsetType[] = [
    'Level',
    'TMTP',
    'TMVM',
    'Zucht',
    'Lehrer',
    'Event',
    'Kampfexklusiv',
    'Meisterung',
    'Entwicklung',
];

export const BLOCKED_LEARNSET_TYPES: LearnsetType[] = ['Kampfexklusiv', 'Entwicklung'];

//not necessarily needed, but this prevents unnecessary warnings
//todo maybe prevent the warnings in the first case instead of blocking them
export const NON_PERMANENT_PKMN_FORMS = [
    'Giratina (Urform)',
    'Weißes Kyurem',
    'Schwarzes Kyurem',
    'Amigento (Drachen-Disc)',
    'Necrozma (Abendmähne)',
    'Necrozma (Morgenschwingen)',
    'Voltolos (Inkarnationsform)',
    'Coronospa (Schimmelreiter)',
    'Coronospa (Rappenreiter)',
];
//!↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
