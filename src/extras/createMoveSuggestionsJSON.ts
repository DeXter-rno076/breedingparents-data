import { NEWEST_GEN, OLDEST_GEN } from "../constants";
import { GamesPerGenUtils } from "../external_data_utils/GamesPerGenUtils";
import { FileLoader } from "../file_managing/FileLoader";
import { GeneralUtils } from "../GeneralUtils";
import { Game, PlainPkmnDataset } from "../types";
import fs from 'fs';
import { TunedPkmnJSON } from "../pkmn-data_adjustements/TunedPkmnJSON";

interface LearnsetBlock {
	games: Game[];
	moves: string[];
}
const map = new Map<string, LearnsetBlock[]>();

main();

function main () {
	for (let gen = OLDEST_GEN; gen <= NEWEST_GEN; gen++) {
		const games = GamesPerGenUtils.getGamesOfGen(gen);
		for (const game of games) {
			addLearnsetsForGame(game);
		}
	}

	const objPendant = GeneralUtils.mapToObject(map);
	fs.writeFileSync('data/out/extras/move_suggestions.json', JSON.stringify(objPendant));
}

function addLearnsetsForGame (game: Game) {
	const fileContent = JSON.parse(FileLoader.getPlainGenPkmnDatasetByGame(game)) as PlainPkmnDataset;
	for (const pkmnName of Object.keys(fileContent)) {
		if (!map.has(pkmnName)) {
			initMapEntryForPkmn(pkmnName);
		}
		const pkmnData = selectPkmnData(pkmnName, fileContent);
		const breedingLearnsets = pkmnData.breedingLearnsets;
		const pkmnLearnsetList = map.get(pkmnName);
		addBreedingLearnsetsToPkmn(game, pkmnLearnsetList, breedingLearnsets);
	}
}

function initMapEntryForPkmn (pkmnName: string) {
	map.set(pkmnName, []);
}

function selectPkmnData (pkmnName: string, pkmnDataset: PlainPkmnDataset): TunedPkmnJSON {
	const pkmnData = pkmnDataset[pkmnName];
	if (!pkmnData.exists) {
		return pkmnData;
	}

	let targetPkmn = '';
	if (pkmnData.unbreedable) {
		targetPkmn = pkmnData.lowestEvo;
	} else {
		targetPkmn = pkmnName;
	}
	const targetPkmnData = pkmnDataset[targetPkmn];
	if (targetPkmnData === undefined) {
		console.log('biep' + targetPkmn + ' # ' + pkmnName);
	}
	return targetPkmnData;
}

function addBreedingLearnsetsToPkmn (game: Game, pkmnLearnsetList: LearnsetBlock[], breedingLearnsets: string[]) {
	for (const pkmnLearnsetBlock of pkmnLearnsetList) {
		if (learnsetListsAreEqual(pkmnLearnsetBlock.moves, breedingLearnsets)) {
			pkmnLearnsetBlock.games.push(game);
			return;
		}
	}
	const learnsetBlock = {
		games: [game],
		moves: breedingLearnsets
	};
	pkmnLearnsetList.push(learnsetBlock);
}

//! only works with no duplications
function learnsetListsAreEqual (a: string[], b: string[]): boolean {
	if (a.length !== b.length) {
		return false;
	}
	for (const item of a) {
		if (!b.includes(item)) {
			return false;
		}
	}
	return true;
}