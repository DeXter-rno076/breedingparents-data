import { createInitialPkmnDataSets } from "./initial_pkmn-data/main";
import createEvoData from "./pkmn-data_adjustements/createEvoData";

main();

async function main () {
	await createEvoData();
	await createInitialPkmnDataSets();
}