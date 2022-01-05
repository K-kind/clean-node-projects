import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Cleaner } from './lib/cleaner';

export const cli = async (rawArgv: string[]) => {
  const argv = yargs(hideBin(rawArgv))
    .usage('Usage: $0 [path] [options]')
    .option('target', {
      alias: 't',
      description: 'Folder names to remove',
      type: 'array',
      default: Cleaner.DEFAULT_TARGETS
    })
    .option('fast', {
      alias: 'f',
      description: 'Do not calculate size',
      type: 'boolean'
    })
    .help()
    .locale('en')
    .parseSync();

  const cleaner = new Cleaner({
    rootPathArg: argv._[0] as string,
    targetDirs: argv.target,
    showSize: !argv.fast
  });

  await cleaner.execute();
};
