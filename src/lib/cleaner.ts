import fs from 'fs';
import path from 'path';
import fastFolderSizeSync from 'fast-folder-size/sync';

import { toFormattedRows, Directory } from './format-rows';
import { selectDirs, Choice } from './propmt';

type Options = {
  logger?: (message: unknown) => void;
  rootPathArg?: string;
};

export class Cleaner {
  static DEFAULT_TARGETS = ['node_modules', 'dist'];

  private logger: NonNullable<Options['logger']>;
  private rootPath: string;
  private targetDirs: string[];

  constructor({ logger = console.log, rootPathArg }: Options = {}) {
    this.logger = logger;
    this.rootPath = this.toRootPath(rootPathArg);
    this.targetDirs = Cleaner.DEFAULT_TARGETS;
  }

  public execute = async () => {
    this.logger(`Scanning folders under ${this.rootPath} …`);
    const dirPaths = this.findDirPaths();
    if (dirPaths.length === 0) {
      this.logger('Target folders were not found.');
      return;
    }

    const dirs = this.calcDirData(dirPaths);
    const selectedDirs = await this.formatAndSelect(dirs);
    if (selectedDirs.length === 0) {
      this.logger('No folders were selected.');
      return;
    }
    const removedDirs = this.removeDirs(selectedDirs);
    this.showResult(removedDirs);
  };

  private toRootPath = (pathArg?: string) => {
    if (!pathArg) return process.cwd();

    // remove trailing slash
    const { dir, base } = path.parse(pathArg);
    return path.join(dir, base);
  };

  private findDirPaths = () => {
    const stat = fs.statSync(this.rootPath);
    if (!stat.isDirectory()) return [];

    const dirPaths: string[] = [];
    this.scanRecursively('', dirPaths);
    return dirPaths;
  };

  private scanRecursively = (relativePath: string, results: string[]) => {
    const fullPath = path.join(this.rootPath, relativePath);
    let dirents;
    try {
      dirents = fs.readdirSync(fullPath, { withFileTypes: true });
    } catch (e) {
      this.logger(e); // TODO: error
      return;
    }

    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;

      const childRelativePath = path.join(relativePath, dirent.name);
      if (this.targetDirs.includes(dirent.name)) {
        results.push(childRelativePath);
      } else {
        this.scanRecursively(childRelativePath, results);
      }
    }
  };

  private calcDirData = (dirPaths: string[]) => {
    return dirPaths.map<Directory>((dirPath) => {
      const fullPath = path.join(this.rootPath, dirPath);
      const lastAccessedAt = fs.statSync(fullPath).atime;
      const bytes = fastFolderSizeSync(fullPath) as number; // TODO:
      const megaBytes = Math.floor(bytes / 1024 / 1024);

      return {
        path: dirPath,
        lastAccessedAt: lastAccessedAt.toLocaleDateString(),
        megaBytes
      };
    });
  };

  private formatAndSelect = (dirs: Directory[]) => {
    const { header, rows } = toFormattedRows(dirs);
    if (rows.length !== dirs.length) {
      throw new Error('Something went wrong when formatting rows.');
    }

    const choices = dirs.map<Choice<Directory>>((dir, index) => ({
      name: rows[index],
      value: dir,
      short: dir.path
    }));

    return selectDirs(choices, header);
  };

  private removeDirs = (dirs: Directory[]) => {
    const removedDirs = [];
    for (const dir of dirs) {
      const fullPath = path.join(this.rootPath, dir.path);
      try {
        fs.rmdirSync(fullPath, { recursive: true });
        removedDirs.push(dir);
      } catch (e) {
        this.logger(e); // TODO: error
      }
    }
    return removedDirs;
  };

  private showResult = (removedDirs: Directory[]) => {
    const [totalCount, totalSize] = removedDirs.reduce(
      ([count, size], dir) => {
        return [++count, size + dir.megaBytes];
      },
      [0, 0]
    );
    this.logger(`${totalCount} folders (${totalSize}MB) were removed.`);
  };
}
