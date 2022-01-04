import fs from 'fs';
import path from 'path';

import { toFormattedRows, Directory } from './format-rows';
import { selectDirs, Choice } from './propmt';
import { readdirSync, rmdirSync, calcDirSizeSync } from '../utils/file';

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
    const dirents = readdirSync(fullPath, { withFileTypes: true });

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

      return {
        path: dirPath,
        lastAccessedAt: fs.statSync(fullPath).atime.toLocaleDateString(),
        megaBytes: calcDirSizeSync(fullPath)
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
      const removed = rmdirSync(fullPath, { recursive: true });
      removed && removedDirs.push(dir);
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
