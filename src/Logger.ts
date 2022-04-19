import fs from 'fs';
import { E_LOG_PATH, WARNING_LOG_PATH, STATUS_LOG_PATH } from './constants';

export default class Logger {
    private static errorOccured = false;

    public static statusLog(msg: string) {
        Logger.log(STATUS_LOG_PATH, msg);
    }

    /**
     * add msg to error log
     * todo add Error as type for $msg
     * @param msg text to add to the error log
     */
    public static elog(msg: string) {
        Logger.errorOccured = true;
        Logger.log(E_LOG_PATH, msg);
        Logger.statusLog(msg);
    }

    /**
     * add msg to warning log
     * @param msg text to add to the warning log
     */
    public static wlog(msg: string) {
        Logger.log(WARNING_LOG_PATH, msg);
        Logger.statusLog(msg);
    }

    private static log(fileName: string, msg: string) {
        fs.appendFileSync(fileName, msg + '\n');
    }

    /**
     * initialises error log, i. e. adds a new line with the current file name to it
     */
    public static initLogs(callingFileName: string) {
        const initTitle =
            callingFileName + ': ==================================================================================';
        Logger.log(E_LOG_PATH, initTitle);
        Logger.log(WARNING_LOG_PATH, initTitle);
        Logger.log(STATUS_LOG_PATH, initTitle);
    }

    public static resetLogs() {
        fs.writeFileSync(E_LOG_PATH, '');
        fs.writeFileSync(WARNING_LOG_PATH, '');
        fs.writeFileSync(STATUS_LOG_PATH, '');
    }

    public static getErrorOccured(): boolean {
        return Logger.errorOccured;
    }
}
