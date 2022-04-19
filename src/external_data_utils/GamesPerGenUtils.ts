import { GamesPerGenFactory } from './factories/GamesPerGenFactory';
import { Game } from '../types';
import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import { NEWEST_GEN } from '../constants';

export abstract class GamesPerGenUtils {
    private static gamesPerGenFactory = new GamesPerGenFactory();
    private static gamesPerGen = GamesPerGenUtils.gamesPerGenFactory.data;
    /**
     * @throws UnexpectedParamValueException
     */
    public static gameToGenNumber(game: Game): number {
        for (const [gen, games] of GamesPerGenUtils.gamesPerGen.entries()) {
            if (games.includes(game)) {
                return parseInt(gen.replace('g', ''));
            }
        }

        throw new InvalidArgumentException('game');
    }

    public static getGamesOfGen(genNumber: number): Game[] {
        if (genNumber < 2 || genNumber > NEWEST_GEN) {
            throw new InvalidArgumentException('genNumber');
        }
        return GamesPerGenUtils.gamesPerGen.get('g' + genNumber);
    }
}
