import fs from 'fs';

import { Bot } from 'mediawiki-bot';
import { EvolutionsData } from '../types';
import Logger from '../LogHandler';

const bot = new Bot(
    'shouldntbeneeded',
    'thisshouldntbeneeded',
    'https://www.pokewiki.de/api.php',
    true
);
const evoDataMap = new Map<string, EvolutionsData>();

/*
! this cant handle branch evolutions yet
they are temporarily handled via. evosManual.json (temporarily meaning IF you have the time to automate it do it, i. e. this will be the permanent solution)
evosManual.json handles left out info in the article as well (but that has to be solved manually in some way)
*/

export default async function createEvoData() {
    Logger.initLogs('createEvoData');
    Logger.statusLog(`creating evo data file`);

    const evoListArticleContent = await bot.getWikitext(
        'Liste von Entwicklungen',
        'Liste der Entwicklungslinien'
    );
    const tableRows = evoListArticleContent.split('|-');

    for (let row of tableRows) {
        handleTableRow(row);
    }

    applyManualEvosData();

    saveMap();
}

/** checks each row cell for pot. pkmn data and creates an evo array based on it
 * evo data gets added to data map via addEvoObjs() based on array
 * @param row row of the wiki table
 */
function handleTableRow(row: string) {
    //Logger.statusLog(`extracting data from table row ${row}`);
    const cellRegex =
        /\|\s*\[\[Datei:.+?\]\]\s*<br \/>\s*Nr\.\d{3,4}\s*(?<pkmn>.+)/;
    const cells = row.split('\n');
    const evos: string[] = [];

    for (let cell of cells) {
        //Logger.statusLog(`extracting data from cell ${cell}`);
        if (!cellRegex.test(cell)) {
            //Logger.statusLog(`skipping cell because it has no pkmn`);
            //cell without a pkmn
            continue;
        }

        const regexRes = cellRegex.exec(cell);
        if (regexRes === null || regexRes.groups === undefined) {
            Logger.elog('handleTableRow: regex didnt worked: ' + cell);
            continue;
        }

        const pkmnName = getPkmnName(regexRes.groups.pkmn);

        //Logger.statusLog(`adding ${pkmnName} to evoline`);
        evos.push(pkmnName);
    }

    if (evos.length < 1) {
        Logger.elog(
            'handleTableRow: evos array is empty ' + JSON.stringify(cells)
        );
        return;
    } else if (evos.length > 3) {
        Logger.elog('error: more than 3 evos ' + evos[0]);
    }

    addEvoObjs(evos);
}

/** creates evo data objs for every entry in evos and adds them to the data map
 * @param evos array of pkmn names in corresponding evolution order
 */
function addEvoObjs(evos: string[]) {
    //Logger.statusLog(`creating and adding evos ${JSON.stringify(evos)}`);
    //you could do this in one loop but there can be only up to 3 array entries
    //so this is ok (and this max amount HOPEFULLY will never ever change)
    // if it does, just automate this and curse TPC
    const stage1Obj: EvolutionsData = {
        pre: '',
        name: evos[0],
        post: evos[1] || '',
    };
    //Logger.statusLog(`adding first evo ${stage1Obj.name}`);
    evoDataMap.set(evos[0], stage1Obj);

    if (evos.length >= 2) {
        const stage2Obj: EvolutionsData = {
            pre: evos[0],
            name: evos[1],
            post: evos[2] || '',
        };
        //Logger.statusLog(`adding second evo ${stage2Obj.name}`);
        evoDataMap.set(evos[1], stage2Obj);
    }
    if (evos.length >= 3) {
        const stage3Obj: EvolutionsData = {
            pre: evos[1],
            name: evos[2],
            post: '',
        };
        //Logger.statusLog(`adding third evo ${stage3Obj.name}`);
        evoDataMap.set(evos[2], stage3Obj);
    }
}

/**
 * creates an object version of the data map and saves it as a file
 */
function saveMap() {
    Logger.statusLog(`saving map`);
    const objForm = Object.fromEntries(evoDataMap);
    fs.writeFileSync('data/evos.json', JSON.stringify(objForm));
}

/** removes brackets and checks for pot. leftovers in the name
 * @param tableCellPkmnName pkmn name retrieved by regex capture group
 * @returns clean pkmn name (i.e. how it will be in the e. g. map keys)
 */
function getPkmnName(tableCellPkmnName: string): string {
    //Logger.statusLog(`extracting pkmn name from table cell`);
    //special forms have a form like "Alola-[[Vulpix]]"
    const cleanName = tableCellPkmnName.replace('[[', '').replace(']]', '');
    if (cleanName.includes('[') || cleanName.includes(']')) {
        Logger.elog(
            'getPkmnName: extracted pkmn name contains [ or ] ' +
                tableCellPkmnName
        );
    }
    //Logger.statusLog(`got name ${cleanName} from ${tableCellPkmnName}`);
    return cleanName;
}

function applyManualEvosData() {
    //Logger.statusLog(`adding manually written evo data`);
    const manualEvosData = JSON.parse(
        fs.readFileSync('data/evosManual.json', { encoding: 'utf-8' })
    ) as { [key: string]: EvolutionsData };

    for (let pkmnName in manualEvosData) {
        //Logger.statusLog(`adding data of ${pkmnName}`);
        evoDataMap.set(pkmnName, manualEvosData[pkmnName]);
    }
}
