import Logger from '../Logger';
import { AdjustedPkmnDataset } from '../types';
import { doToAllPkmnDataFiles } from './utils';

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

    doToAllPkmnDataFiles(doshit);
}

function doshit(jsonData: AdjustedPkmnDataset) {
    const allMoves = new Set<string>();

    for (const pkmn of Object.values(jsonData)) {
        addLearnsetToMovesSet(allMoves, pkmn.breedingLearnsets);
        //todo all learnsets
        //only breeding learnsets because only these are needed
    }
    addAllMovesToFarbeagle(allMoves, jsonData);
    allMoves.clear();
}

function addLearnsetToMovesSet(movesSet: Set<string>, learnset: string[]) {
    for (const move of learnset) {
        movesSet.add(move);
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
