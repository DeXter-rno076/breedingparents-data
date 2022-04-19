import { UnexpectedParamValueException } from './initial_pkmn-data/exceptions/UnexpectedParamValueException';
import { LearnsetType } from './types';
import { GAME_SK_LIST, GAME_SK_ALIASES, NEWEST_GEN, OLDEST_GEN } from './constants';
import { InvalidArgumentException } from './exceptions/InvalidArgumentException';

export abstract class GeneralUtils {
    /**
     * @throws UnexpectedParamValueException
     */
    public static validateLearnsetType(learnsetType: string): LearnsetType {
        switch (learnsetType) {
            case 'Level':
                return 'Level';
            case 'TMTP':
                return 'TMTP';
            case 'TMVM':
                return 'TMVM';
            case 'Lehrer':
                return 'Lehrer';
            case 'Zucht':
                return 'Zucht';
            case 'Event':
                return 'Event';
            case 'Kampfexklusiv':
                return 'Kampfexklusiv';
            case 'Meisterung':
                return 'Meisterung';
            case 'Entwicklung':
                return 'Entwicklung';
            default:
                throw new InvalidArgumentException('learnsetType', 'valid learnset type');
        }
    }

    public static isValidGame(game: string): boolean {
        if (GAME_SK_LIST.includes(game)) {
            return true;
        }
        if (GAME_SK_ALIASES[game] !== undefined) {
            return true;
        }

        return false;
    }

    public static genIsValid(gen: number): boolean {
        return gen >= 2 && gen <= NEWEST_GEN;
    }

    public static generateGenList(): number[] {
        const genList: number[] = [];
        for (let i = OLDEST_GEN; i <= NEWEST_GEN; i++) {
            genList.push(i);
        }
        return genList;
    }

    public static mapToObject(map: Map<any, any>): object {
        return Object.fromEntries(map);
    }
}
