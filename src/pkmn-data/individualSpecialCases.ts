import Logger from "../LogHandler";
import { PkmnDataJSONObj } from "../types";
import { getJSONPkmnData, getPkmnDataFiles, savePkmnData } from "../utils";

export function handleIndividualSpecialCases () {
    Logger.initLogs('individualSpecialCases');
    farbeagle();
}

function farbeagle () {
    /*farbeagle can have via Sketch pot. every move => can pass on every move
    this is solved by just adding every move to its direct learnsets
    but only moves are needed that can be inherited by other pkmn
    => to reduce text only breeding learnsets are collectet 
    and fused into farbeagle's direct learnsets*/
    const allMoves = new Set<string>();
    const pkmnFiles = getPkmnDataFiles();
    for (let file of pkmnFiles) {
        const jsonData = getJSONPkmnData(file);
        for (const pkmn of Object.values(jsonData)) {
            addLearnsetToMovesSet(allMoves, pkmn.breedingLearnsets);
            //only breeding learnsets because only these are needed
        }
        addAllMovesToFarbeagle(allMoves, jsonData);
        allMoves.clear();
        savePkmnData(file, jsonData);
    }
}

function addLearnsetToMovesSet (movesSet: Set<string>, learnset: string[]) {
    for (const move of learnset) {
        movesSet.add(move);
    }
}

function addAllMovesToFarbeagle (allMoves: Set<string>, jsonData: PkmnDataJSONObj) {
    const farbeagleObj = jsonData['Farbeagle'];
    if (farbeagleObj === undefined) {
        Logger.elog('addAllMovesToFarbeagle: could\'t find farbeagle in json data');
        return;
    }
    farbeagleObj.directLearnsets = Array.from(allMoves);
}