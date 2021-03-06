import yargs from 'yargs';
import { Cleaner } from './lib/cleaner';

export const cli = async (rawArgv: string[]) => {
  const argv = parseArgs(rawArgv);

  const cleaner = new Cleaner({
    rootPathArg: argv._[0]?.toString(),
    targetDirs: argv.target,
    showSize: !argv.quick
  });

  await cleaner.execute();
};

const parseArgs = (rawArgv: string[]) => {
  const slicedArgs = rawArgv.slice(2);
  return yargs(slicedArgs)
    .usage('Usage: $0 [path] [options]')
    .option('target', {
      alias: 't',
      description: 'Folder names to find',
      type: 'array',
      default: Cleaner.DEFAULT_TARGETS
    })
    .option('quick', {
      alias: 'q',
      description: 'Do not calculate size',
      type: 'boolean'
    })
    .example(
      '$0',
      `Find ${Cleaner.DEFAULT_TARGETS.join(
        ', '
      )} folders under the current path and remove selected ones.`
    )
    .example(
      '$0 ~/Desktop --target node_modules build',
      `Find node_modules and build folders under the Desktop and remove selected ones.`
    )
    .help()
    .locale('en')
    .wrap(90)
    .parseSync();
};
