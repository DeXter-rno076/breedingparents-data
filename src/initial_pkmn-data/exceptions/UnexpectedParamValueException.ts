export class UnexpectedParamValueException extends Error {
    public constructor(unexpectedValue: string, expectedType: string, templateName: string) {
        super(
            'unexpected parameter value ' +
                unexpectedValue +
                '; expected value of type ' +
                expectedType +
                '; on page ' +
                templateName
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedParamValueException);
        }
    }
}
