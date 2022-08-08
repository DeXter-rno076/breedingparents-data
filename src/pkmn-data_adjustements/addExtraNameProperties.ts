import { SpecialformsUtils } from "../external_data_utils/SpecialformsUtils";
import { AdjustedPkmnDataset } from "../types";
import { AdjustedPkmnJSON } from "./AdjustedPkmnJSON";
import { doToAllPlainPkmnDataFiles } from "./utils";

export function addExtraNameProperties () {
	doToAllPlainPkmnDataFiles(addExtraNamesToFile);
}

function addExtraNamesToFile (externalPkmnData: AdjustedPkmnDataset) {
	for (const [pkmnName, pkmnData] of Object.entries(externalPkmnData)) {
		addExtraNamesToPkmn(pkmnData);
	}
}

function addExtraNamesToPkmn (pkmnData: AdjustedPkmnJSON) {
	addCorrectlyWrittenPkmnName(pkmnData);
	addSubpageLinkPkmnName(pkmnData);
}

function addCorrectlyWrittenPkmnName (pkmnData: AdjustedPkmnJSON) {
	pkmnData.correctlyWrittenName = pkmnData.name;
}

function addSubpageLinkPkmnName (pkmnData: AdjustedPkmnJSON) {
	let subpageLinkName = '';
	if (SpecialformsUtils.isSpecialForm(pkmnData.name)) {
		const normalForm = SpecialformsUtils.getNormalformIdentifierOfSpecialForm(pkmnData.name);
		subpageLinkName = normalForm.name;
	} else {
		subpageLinkName = pkmnData.name;
	}

	pkmnData.subpageLinkName = subpageLinkName;
}