import { Bot, CatMember } from 'mediawiki-bot';
import Logger from '../Logger';
import { Game } from '../types';
import { LearnsetTablesFactory } from './LearnsetTablesFactory';
import { PkmnFactory } from './PkmnFactory';
import { Pkmn } from './Pkmn';
import { PLAIN_DATASET_FILES_PKMN_DIR } from '../constants';
import { InitialPkmnJSON } from './InitialPkmnJSON';
import { FileSaver } from '../file_managing/FileSaver';
import { FilePathBuilder } from '../file_managing/FilePathBuilder';
import { FileSystemInitializer } from '../file_managing/FileSystemInitializer';
import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import { GeneralUtils } from '../GeneralUtils';
import { SpecialformsUtils } from '../external_data_utils/SpecialformsUtils';

export const bot = new Bot('', '', 'https://www.pokewiki.de/api.php');
let pkmnNameList: CatMember[] = [];
const FIRST_PKMN_ALPHABETICALLY = 'Aalabyss';

export async function createInitialPkmnDataSets() {
    Logger.initLogs('initial_pkmn-data');
    pkmnNameList = await loadPkmnNameList();

    await createDatasetsForAllGens();
}

async function loadPkmnNameList(): Promise<CatMember[]> {
    return await bot.getCatMembers('Kategorie:Pokémon');
}

async function createDatasetsForAllGens() {
    const gens = GeneralUtils.generateGenList();
    initFileStructure(gens);

    for (const gen of gens) {
        Logger.statusLog('creating initial data sets for gen ' + gen);
        await createPkmnDataSetsOfGen(gen);
    }
}

function initFileStructure(gens: number[]) {
    FileSystemInitializer.createDirectoryIfNeeded(PLAIN_DATASET_FILES_PKMN_DIR);
    for (const gen of gens) {
        const plainGenDataSetPath = FilePathBuilder.buildPlainGenPkmnDirPath(gen);
        FileSystemInitializer.createDirectoryIfNeeded(plainGenDataSetPath);
    }
}

async function createPkmnDataSetsOfGen(gen: number) {
    const games = loadGameList(gen);

    for (const game of games) {
        Logger.statusLog('creating data sets for game ' + game);
        const pkmns = await createPkmnDataSetsOfGame(game);
        const pkmnsJSONString = buildPkmnsJSONString(pkmns);

        savePkmnsJSON(game, pkmnsJSONString);
    }
}

function loadGameList(gen: number): Game[] {
    return GamesPerGenUtils.getGamesOfGen(gen);
}

async function createPkmnDataSetsOfGame(game: Game): Promise<Pkmn[]> {
    let pkmns: Pkmn[] = [];
    let skip = true;
    for (const pkmnPage of pkmnNameList) {
        if (pkmnPage.title === FIRST_PKMN_ALPHABETICALLY) {
            skip = false;
        }
        if (skip) {
            continue;
        }

        try {
            const pkmn = await createPkmnDataSet(pkmnPage.title, game);
            pkmns.push(pkmn);
            if (SpecialformsUtils.hasSpecialForm(pkmnPage.title)) {
                pkmns = pkmns.concat(await createSpecialFormDataSetsOfPkmn(pkmnPage.title, game));
            }
        } catch (e) {
            Logger.elog(e.stack + '\n');
        }

        Logger.statusLog(pkmnPage.title + ' in ' + game + ' done');
    }

    return pkmns;
}

async function createPkmnDataSet(pkmnName: string, game: Game): Promise<Pkmn> {
    Logger.statusLog('creating data set for ' + pkmnName + ' in ' + game);
    const pkmnFactory = new PkmnFactory(pkmnName, game);
    const pkmn = await pkmnFactory.construct();

    const learnsetTablesFactory = new LearnsetTablesFactory(pkmn);
    const learnsetTables = await learnsetTablesFactory.construct();

    for (const learnsetTable of learnsetTables) {
        pkmn.addLearnset(learnsetTable);
    }

    return pkmn;
}

async function createSpecialFormDataSetsOfPkmn(pkmnName: string, game: Game): Promise<Pkmn[]> {
    const specialFormNames = SpecialformsUtils.getSpecialformNamesFromNormalform(pkmnName);
    const specialFormJSONs: Pkmn[] = [];
    for (const specialFormName of specialFormNames) {
        specialFormJSONs.push(await createPkmnDataSet(specialFormName, game));
    }

    return specialFormJSONs;
}

function buildPkmnsJSONString(pkmns: Pkmn[]): string {
    const pkmnMap = new Map<string, InitialPkmnJSON>();

    for (const pkmn of pkmns) {
        pkmnMap.set(pkmn.getName(), pkmn.toDatasetJSON());
    }

    const objectRepresentation = mapToObject(pkmnMap);

    return JSON.stringify(objectRepresentation);
}

function savePkmnsJSON(game: Game, pkmnJSONString: string) {
    FileSaver.savePlainGenPkmnDatasetByGame(game, pkmnJSONString);
}

function mapToObject(pkmnMap: Map<string, InitialPkmnJSON>) {
    return Object.fromEntries(pkmnMap);
}
