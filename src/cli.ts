import { Cleaner } from './lib/cleaner';

export const cli = async (argv: string[]) => {
  const cleaner = new Cleaner({
    rootPathArg: argv[2]
  });
  await cleaner.execute();
};
