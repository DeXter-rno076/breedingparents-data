import { GeneralUtils } from './GeneralUtils';
import { TunedPkmnJSON } from './pkmn-data_adjustements/TunedPkmnJSON';

export class PkmnChecker {
    private pkmn: TunedPkmnJSON;

    public constructor(pkmn: TunedPkmnJSON) {
        this.pkmn = pkmn;
    }

    public check() {
        this.checkAttributeExistence();
        this.checkIndividualAttributes();
        this.checkForSpecialCharacters();
        this.checkForUnwantedTemplates();
    }

    private checkIndividualAttributes() {
        const pkmn = this.pkmn;
        if (!GeneralUtils.isValidGame(pkmn.game)) {
            throw 'game wrong';
        }
        if (/todo/.test(pkmn.name)) {
        }
        if (!/\d{1,4}\w*/.test(pkmn.id)) {
            throw 'id wrong';
        }
    }

    private checkAttributeExistence() {
        const pkmn = this.pkmn;
        const mustHaveAttributeList: (keyof TunedPkmnJSON)[] = [
            'game',
            'exists',
            'name',
            'id',
            'eggGroup1',
            'eggGroup2',
            'gender',
            'lowestEvo',
            'unpairable',
            'unbreedable',
            'directLearnsets',
            'breedingLearnsets',
            'eventLearnsets',
            'oldGenLearnsets',
        ];

        for (let attribute of mustHaveAttributeList) {
            if (pkmn[attribute] === undefined) {
                throw pkmn.name + ' is missing attribute ' + attribute;
            }
        }
    }

    private checkForUnwantedTemplates() {
        const templRegex = /##TEMPLATE:\d+##/;

        const checkValue = (v: string, attr: string) => {
            if (templRegex.test(v)) {
                throw 'template found in ' + attr;
            }
        };

        for (const [k, v] of Object.entries(this.pkmn)) {
            if (typeof v !== 'string') {
                continue;
            }

            if (Array.isArray(v)) {
                for (let item of v) {
                    checkValue(item, k);
                }
            } else {
                checkValue(v, k);
            }
        }
    }

    private checkForSpecialCharacters() {
        const specialCharacterList = ['&nbsp;', '&gt;', '&lt;', '&amp;', '&apos', '&quot'];

        const checkValue = (v: string, attr: string) => {
            for (let specialChar of specialCharacterList) {
                if (v.includes(specialChar)) {
                    throw `special char ${specialChar} in attribute ${attr}`;
                }
            }
        };

        for (const [k, v] of Object.entries(this.pkmn)) {
            if (typeof v !== 'string') {
                continue;
            }

            if (Array.isArray(v)) {
                for (let item of v) {
                    checkValue(item, k);
                }
            } else {
                checkValue(v, k);
            }
        }
    }
}
