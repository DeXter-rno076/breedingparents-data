import fs from 'fs';

import { PkmnObj } from './PkmnObj';
import Logger from './LogHandler';
import { DATA_OUTPUT_DIR, NEWEST_GEN, OLDEST_GEN } from './constants';
import { PkmnDataJSONObj } from './types';

export default class PkmnObjChecker {
    private errorlog = '';
    private warninglog = '';

    constructor() {}

    public testAll() {
        Logger.initLogs('PkmnObjChecker');
        Logger.statusLog(`checking all pkmn objs for invalid data`);
        for (let i = OLDEST_GEN; i < NEWEST_GEN; i++) {
            this.checkGen(i);
        }
        Logger.statusLog(`finished checking all pkmn objs for invalid data`);
    }

    private checkGen(gen: number) {
        Logger.statusLog(`checking pkmn objs of gen ${gen} for invalid data`);
        Logger.statusLog(`loading pkmn data`);
        const genPkmnData = fs.readFileSync(
            DATA_OUTPUT_DIR + '/pkmnDataGen' + gen + '.json',
            { encoding: 'utf-8' }
        );
        Logger.statusLog(`parsing pkmn data`);
        const parsedPkmnDataObj = JSON.parse(genPkmnData) as PkmnDataJSONObj;

        Logger.statusLog(`checking each pkmn obj`);
        for (const v of Object.values(parsedPkmnDataObj)) {
            this.check(v);
        }
    }

    public check(pkmnObj: PkmnObj): boolean {
        /* Logger.statusLog(
            `checking ${pkmnObj.name} for invalid property values`
        ); */
        this.checkAttributeExistence(pkmnObj);
        this.checkForUnwantedTemplates(pkmnObj);
        this.checkForSpecialCharacters(pkmnObj);

        let passed = this.errorlog.length === 0;

        this.saveLogs();

        /* Logger.statusLog(
            `finished checking of ${pkmnObj.name}, ${
                passed ? 'passed' : 'failed'
            }`
        ); */
        return passed;
    }

    private checkAttributeExistence(pkmnObj: PkmnObj) {
        //Logger.statusLog(`checking existence of all must have attributes`);
        const mustHaveAttributeList: (keyof PkmnObj)[] = [
            'name',
            'id',
            'eggGroup1',
            'eggGroup2',
            'gender',
            'lowestEvolution',
            'unpairable',
            'unbreedable',
            'directLearnsets',
            'breedingLearnsets',
            'eventLearnsets',
            'oldGenLearnsets'
        ];
        const normallyExpectedAttributeList: (keyof PkmnObj)[] = [];

        for (let attribute of mustHaveAttributeList) {
            if (pkmnObj[attribute] === undefined) {
                //Logger.statusLog(`found missing property ${attribute}`);
                this.addELog(
                    pkmnObj.name + ' is missing attribute ' + attribute
                );
            }
        }
        for (let attribute of normallyExpectedAttributeList) {
            if (pkmnObj[attribute] === undefined) {
                this.addWLog(
                    pkmnObj.name + ' is missing attribute ' + attribute
                );
            }
        }
    }

    private checkForUnwantedTemplates(pkmnObj: PkmnObj) {
        //Logger.statusLog(`checking for unwanted templates`);
        const templRegex = /##TEMPLATE:\d+##/;

        const checkValue = (v: string, attr: string) => {
            if (templRegex.test(v)) {
                //Logger.statusLog(`found template in ${attr}`);
                this.addELog('template found in ' + attr);
            }
        };

        for (const [k, v] of Object.entries(pkmnObj)) {
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

    private checkForSpecialCharacters(pkmnObj: PkmnObj) {
        //Logger.statusLog(`checking for special characters like HTML entities`);
        const specialCharacterList = [
            '&nbsp;',
            '&gt;',
            '&lt;',
            '&amp;',
            '&apos',
            '&quot',
        ];

        const checkValue = (v: string, attr: string) => {
            for (let specialChar of specialCharacterList) {
                if (v.includes(specialChar)) {
                    //Logger.statusLog(`found ${specialChar} in ${attr}`);
                    this.addELog(
                        `special char ${specialChar} in attribute ${attr}`
                    );
                }
            }
        };

        for (const [k, v] of Object.entries(pkmnObj)) {
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

    private addELog(msg: string) {
        this.errorlog += '\t* ' + msg + '\n';
    }

    private addWLog(msg: string) {
        this.warninglog += '\t* ' + msg + '\n';
    }

    private saveLogs() {
        //Logger.statusLog(`saving logs of PkmnObj checking run`);
        if (this.errorlog.length > 0) {
            let logText = 'PkmnObjChecker found following errors:\n';
            logText += this.errorlog;
            Logger.elog(logText);
        }
        if (this.warninglog.length > 0) {
            let logText = 'PkmnObjChecker found following pot. problems:\n';
            logText += this.warninglog;
            Logger.wlog(logText);
        }

        this.errorlog = '';
        this.warninglog = '';
    }
}
