export class UnexpectedExternalDataException extends Error {
    public constructor(filePath: string, notes = '') {
        super('unexpected data found in ' + filePath + '; ' + notes);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedExternalDataException);
        }
    }
}
