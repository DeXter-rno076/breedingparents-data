export class ParamNotFoundException extends Error {
    public constructor(paramName: string, templateName: string) {
        super('param ' + paramName + ' not found in template ' + templateName);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParamNotFoundException);
        }
    }
}
