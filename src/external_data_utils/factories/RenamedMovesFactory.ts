import { UnexpectedExternalDataException } from '../../exceptions/UnexpectedExternalDataException';
import Logger from '../../Logger';
import { MoveRenamingInfo } from '../../types';
import { ExternalDataUtilsFactory } from './ExternalDataUtilsFactory';

export class RenamedMovesFactory extends ExternalDataUtilsFactory<MoveRenamingInfo[]> {
    public constructor() {
        super('renamedMovesData.json');
        Logger.statusLog('building RenamedMoves instance');
    }

    protected externalJSONToInternalStructure(externalJSON: object): MoveRenamingInfo[] {
        const renamedMoves: MoveRenamingInfo[] = [];

        for (const moveRenaming of Object.values(externalJSON)) {
            const oldNames = moveRenaming.oldNames;
            const currentName = moveRenaming.currentName;

            this.checkOldNames(oldNames);
            this.checkCurrentName(currentName);

            renamedMoves.push({
                oldNames,
                currentName,
            });
        }

        return renamedMoves;
    }

    private checkOldNames(oldNames: any) {
        if (!this.isStringArray(oldNames)) {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'old move names should be a string array');
        }
    }

    private checkCurrentName(currentName: any) {
        if (typeof currentName !== 'string') {
            throw new UnexpectedExternalDataException(this.FILE_NAME, 'current move name should be a string');
        }
    }
}
