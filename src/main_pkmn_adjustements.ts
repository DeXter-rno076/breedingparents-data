import { setExists } from './pkmn-data_adjustements/setExists';
import { addEvolutions } from './pkmn-data_adjustements/addEvolutions';
import addLowestEvolution from "./pkmn-data_adjustements/addLowestEvolution";
import handleUnbreedables from './pkmn-data_adjustements/handleUnbreedables';
import handleUnpairables from './pkmn-data_adjustements/handleUnpairables';
import { handleIndividualSpecialCases } from './pkmn-data_adjustements/individualSpecialCases';
import addOldGenLearnsets from './pkmn-data_adjustements/oldGenLearnsets';
import { replaceOldMoveNames } from './pkmn-data_adjustements/replaceOldMoveNames';
import { addExtraNameProperties } from './pkmn-data_adjustements/addExtraNameProperties';

main();

function main () {
	setExists();
	addEvolutions();
	addLowestEvolution();
	addExtraNameProperties();
	//!unpairables BEFORE unbreedable
	handleUnpairables();
	handleUnbreedables();
	//!addOldGenLearnsets AFTER setExists
	addOldGenLearnsets();
	//!handleIndividualSpecialCases AFTER addOldGenLearnsets
	handleIndividualSpecialCases();
	
	//!last adjustements
	replaceOldMoveNames();
}
