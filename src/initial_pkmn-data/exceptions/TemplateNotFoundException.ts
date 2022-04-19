export class TemplateNotFoundException extends Error {
    public constructor(templateName: string, page: string) {
        super('couldnt find template ' + templateName + ' of ' + page);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TemplateNotFoundException);
        }
    }
}
