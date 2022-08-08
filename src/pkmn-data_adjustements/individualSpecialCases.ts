import { GamesPerGenUtils } from '../external_data_utils/GamesPerGenUtils';
import Logger from '../Logger';
import { AdjustedPkmnDataset } from '../types';
import { doToAllPlainPkmnDataFiles } from './utils';

export function handleIndividualSpecialCases() {
    Logger.initLogs('individualSpecialCases');
    farbeagle();
}

function farbeagle() {
    /*farbeagle can have via Sketch pot. every move => can pass on every move
    this is solved by just adding every move to its direct learnsets
    but only moves are needed that can be inherited by other pkmn
    => to reduce text only breeding learnsets are collectet 
    and fused into farbeagle's direct learnsets*/

    doToAllPlainPkmnDataFiles(doshit);
}

function doshit(jsonData: AdjustedPkmnDataset) {
    const allMoves = new Set<string>();

    for (const pkmn of Object.values(jsonData)) {
		const gen = GamesPerGenUtils.gameToGenNumber(pkmn.game);
        addLearnsetToMovesSet(allMoves, pkmn.breedingLearnsets, gen);
		addLearnsetToMovesSet(allMoves, pkmn.directLearnsets, gen);
		addLearnsetToMovesSet(allMoves, pkmn.eventLearnsets, gen);
		addLearnsetToMovesSet(allMoves, pkmn.oldGenLearnsets, gen);
    }
    addAllMovesToFarbeagle(allMoves, jsonData);
    allMoves.clear();
}

function addLearnsetToMovesSet(movesSet: Set<string>, learnset: string[], gen: number) {
    const BLOCKED_MOVES = getMovesBlockedByNachahmerList(gen);
	for (const move of learnset) {
		if (!BLOCKED_MOVES.includes(move)) {
			movesSet.add(move);
		}
    }
}

function getMovesBlockedByNachahmerList (gen: number): string[] {
	switch (gen) {
		case 2:
			return ['Explosion', 'Finale', 'Metronom', 'Verzweifler', 'Wandler', 'Nachahmer'];
		default:
			return ['Geschwätz', 'Verzweifler'];
	}
}

function addAllMovesToFarbeagle(allMoves: Set<string>, jsonData: AdjustedPkmnDataset) {
    const farbeagleObj = jsonData['Farbeagle'];
    if (farbeagleObj === undefined) {
        Logger.elog("addAllMovesToFarbeagle: could't find farbeagle in json data");
        return;
    }
    farbeagleObj.directLearnsets = Array.from(allMoves);
}
