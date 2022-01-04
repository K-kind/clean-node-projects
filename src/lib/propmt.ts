import inquirer from 'inquirer';

export type Choice<T> = {
  name: string;
  value: T;
  short: string;
};

export const selectDirs = async <T>(choices: Choice<T>[], header: string) => {
  const result = await inquirer.prompt<{ folders: T[] }>({
    type: 'checkbox',
    name: 'folders',
    message: `Choose folders to remove (total: ${choices.length}).`,
    pageSize: 12,
    choices: [new inquirer.Separator(`  ${header}`), ...choices],
    loop: false
  });
  return result.folders;
};
