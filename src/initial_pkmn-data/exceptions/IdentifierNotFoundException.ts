export class IdentifierNotFoundException extends Error {
    public constructor(pkmnName: string, game = '') {
        super('couldnt find identifier for ' + pkmnName + (game !== '' ? 'in game ' + game : ''));

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IdentifierNotFoundException);
        }
    }
}
