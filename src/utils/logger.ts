import util from 'util';

export class Logger {
    private static async getChalk() {
        const chalk = (await import('chalk')).default;
        return chalk;
    }

    private static async log(level: string, color: string, icon: string, message: any, ...optionalParams: any[]) {
        const chalk = await this.getChalk();
        const timestamp = new Date().toISOString();
        const formattedMessage = util.format(message, ...optionalParams); // Permite placeholders

        console.log(chalk.hex(color)(`${icon} [${timestamp}] ${level}: ${formattedMessage}`));
    }

    static async success(message: any, ...optionalParams: any[]) {
        await this.log('Success', '#28A745', '✅', message, ...optionalParams);
    }

    static async info(message: any, ...optionalParams: any[]) {
        await this.log('Info', '#0099FF', 'ℹ️ ', message, ...optionalParams);
    }

    static async warning(message: any, ...optionalParams: any[]) {
        await this.log('Warning', '#FFA500', '⚠️', message, ...optionalParams);
    }

    static async error(message: any, ...optionalParams: any[]) {
        await this.log('Error', '#FF2D55', '❌', message, ...optionalParams);
    }

    static async debug(message: any, ...optionalParams: any[]) {
        await this.log('Debug', '#808080', '🐞', message, ...optionalParams);
    }
}


export const logExecutionTime = async (time_start: Date) => {
    const time_end = new Date();
    const time_diff = time_end.getTime() - time_start.getTime();
    const time_diff_sec = Math.floor(time_diff / 1000); // Total en segundos

    const minutes = Math.floor(time_diff_sec / 60);
    const seconds = time_diff_sec % 60;

    let timeMessage = "⏱️ Total time: ";

    if (minutes > 0) {
        timeMessage += `${minutes} min${minutes > 1 ? "s" : ""}`;
    }
    if (seconds > 0 || minutes === 0) {
        timeMessage += ` ${seconds} sec${seconds > 1 ? "s" : ""}`;
    }

    await Logger.info(`${timeMessage} \n`);
}