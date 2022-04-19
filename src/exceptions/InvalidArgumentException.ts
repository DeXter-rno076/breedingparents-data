export class InvalidArgumentException extends Error {
    public constructor(paramName: string, expected = '') {
        super('parameter ' + paramName + ' got invalid value; ' + expected);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidArgumentException);
        }
    }
}
