import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { PkmnEvolutionLink, PkmnEvolutions } from '../../types';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export class EvolutionsFactory extends ExternalDataUtilsFactory<PkmnEvolutions> {
    public constructor() {
        super('evos.json');
        Logger.statusLog('building Evolutions instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): PkmnEvolutions {
        const pkmnEvolutionsMap = new Map<string, PkmnEvolutionLink>();

        for (const [pkmnName, evolutionLink] of Object.entries(externalJSON)) {
            const pre = evolutionLink.pre;
            const name = evolutionLink.name;
            const post = evolutionLink.post;

            if (pkmnName !== name) {
                throw new UnexpectedExternalDataException(
                    this.FILE_NAME,
                    'evolution link of ' + pkmnName + ' has differences in pkmn names'
                );
            }
            if (this.containsUndefinedOrNull([pre, name, post])) {
                throw new UnexpectedExternalDataException(
                    this.FILE_NAME,
                    'evolution link of ' + pkmnName + ' has an undefined value'
                );
            }

            const t: PkmnEvolutionLink = {
                pre,
                name,
                post,
            };
            pkmnEvolutionsMap.set(name, t);
        }

        return pkmnEvolutionsMap;
    }
}
