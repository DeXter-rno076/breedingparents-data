import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';
import { Game } from '../../types';
import { GeneralUtils } from '../../GeneralUtils';
import Logger from '../../Logger';

export class GamesPerGenFactory extends ExternalDataUtilsFactory<Map<string, Game[]>> {
    public constructor() {
        super('games_per_gen.json');
        Logger.statusLog('building GamesPerGen instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): Map<string, Game[]> {
        const gamesPerGenMap = new Map<string, Game[]>();

        for (const [gen, games] of Object.entries(externalJSON)) {
            this.checkGen(gen);
            this.checkGames(games);

            gamesPerGenMap.set(gen, games);
        }

        return gamesPerGenMap;
    }

    private checkGen(gen: any) {
        if (typeof gen !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'gen should be a string: ' + gen);
        }

        if (!/g\d/.test(gen)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'gen should match the pattern g\\d: ' + gen);
        }
    }

    private checkGames(games: any) {
        if (!Array.isArray(games)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'games should be an array: ' + games);
        }

        if (!this.areAllString(games)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'games should all be strings: ' + games);
        }

        for (const game of games) {
            if (!GeneralUtils.isValidGame(game)) {
                throw new UnexpectedExternalDataException(this.FILE_NAME, 'unknown game found: ' + game);
            }
        }
    }
}
