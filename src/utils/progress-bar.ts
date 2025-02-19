import cliProgress from 'cli-progress';
import { listenProgress } from './channels';

/**
 * Displays a progress bar for a given task.
 * @param taskId Task identifier.
 */
export const progressBar = async (taskId: string): Promise<void> => {
  const chalk = (await import('chalk')).default; // Dynamic import

  return new Promise(async (resolve) => {
    const total = 100;
    const progressBar = new cliProgress.SingleBar(
      {
        format: (options, params, payload) => {
          const completeLength = Math.round(params.progress * options.barsize);
          const incompleteLength = options.barsize - completeLength;

          const timeColors = `${chalk.hex('#0099FF')(`[${new Date().toISOString()}]`)} ${chalk.hex('#0099FF')('Progress:')}`;

          const bar =
            chalk.hex('#FF2D55')('━'.repeat(completeLength)) + // Completed (pink)
            chalk.hex('#808080')('━'.repeat(incompleteLength)); // Remaining (gray)

          const percentage = chalk.hex('#AF4FFF')(
            `${params.value.toFixed(2)}%`
          ); // Purple
          const eta = chalk.hex('#0099FF')(payload.eta); // Blue

          return `🕖 ${timeColors}  ${bar}   ${percentage}  ${eta}`;
        },
        barsize: 30,
        hideCursor: true,
      },
      cliProgress.Presets.shades_grey
    );

    progressBar.start(total, 0, { eta: '0:00:--' });

    await listenProgress(taskId, (progress: number) => {
      const eta = `0:00:0${Math.max(1, Math.floor((total - progress) / 10))}`; // Simulated ETA

      progressBar.update(progress, { eta });

      if (progress >= 100) {
        progressBar.stop();
        console.log(`\n`);
        resolve();
      }
    });
  });
};
