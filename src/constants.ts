/**
 * rough length limit of the formatted JSON object
 * formatting about doubles the length and mediawiki does it automatically
 * => unformatted JSON files will have about half the size of this value
 * if you have custom max page sizes and they're enough, just set the constant to something like 9999999999999
 * 600_000 should be sufficient for default mediawiki config
 */
export const MAX_FILE_LENGTH = 600_000;

const DATA_DIR = 'data';
const LOG_PATH = DATA_DIR + '/logs';
export const E_LOG_PATH = LOG_PATH + '/errorlog.txt';
export const WARNING_LOG_PATH = LOG_PATH + '/warninglog.txt';
export const STATUS_LOG_PATH = LOG_PATH + '/statuslog.txt';

export const DATA_OUTPUT_DIR = DATA_DIR + '/output';
export const SEP_DATA_OUTPUT_DIR = DATA_DIR + '/separatedoutput';
export const OLDEST_GEN = 2;

//!↓↓↓↓↓↓↓↓↓↓↓↓↓ HAS TO BE UPDATED ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
export const NEWEST_GEN = 8;
//LGP and LGE are left out intendedly because they are irrelevant for breeding
//they only might be needed for oldGenLearnsets
export const MAIN_GAME_SK_LIST = [
    'R',
    'B',
    'Ge',
    'Go',
    'Si',
    'K',
    'RU',
    'SA',
    'SM',
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
    'SW',
    'SH',
    'SWEX',
    'SHEX',
    'SD',
    'LP',
];
export const SKIP_MAINGAME_SK_LIST = ['LGP', 'LGE'];

//not necessarily needed, but this prevents unnecessary warnings
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
