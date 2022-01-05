import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

import { toFormattedRows, Directory } from './format-rows';
import { selectDirs, Choice } from './propmt';
import { readdirSync, rmdirSync, calcDirSizeSync } from '../utils/file';

type Options = {
  logger?: (message: unknown) => void;
  rootPathArg?: string;
  targetDirs?: string[];
  showSize?: boolean;
};

export class Cleaner {
  static DEFAULT_TARGETS = ['node_modules', 'dist'];

  private logger: NonNullable<Options['logger']>;
  private rootPath: string;
  private targetDirs: string[];
  private showSize: boolean;

  constructor({
    logger = console.log,
    rootPathArg,
    targetDirs,
    showSize
  }: Options = {}) {
    this.logger = logger;
    this.rootPath = this.toRootPath(rootPathArg);
    this.targetDirs = targetDirs ?? Cleaner.DEFAULT_TARGETS;
    this.showSize = showSize ?? true;
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

    return path.resolve(pathArg); // absolute path
  };

  private findDirPaths = () => {
    try {
      const stat = fs.statSync(this.rootPath);
      if (!stat.isDirectory()) return [];
    } catch (e) {
      this.logger(e instanceof Error ? e.message : e);
      return [];
    }

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
      const sizeInfo = this.showSize
        ? { megaBytes: calcDirSizeSync(fullPath) }
        : {};

      return {
        path: dirPath,
        lastAccessedAt: format(fs.statSync(fullPath).atime, 'yyyy/MM/dd'),
        ...sizeInfo
      };
    });
  };

  private formatAndSelect = (dirs: Directory[]) => {
    const { header, rows } = toFormattedRows(dirs);
    if (rows.length !== dirs.length) {
      throw new Error(
        'Something went wrong when formatting rows.\nOperation was canceled (No folders were removed).'
      );
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
        return [count + 1, size + (dir.megaBytes ?? 0)];
      },
      [0, 0]
    );
    if (this.showSize) {
      this.logger(`${totalCount} folders (${totalSize}MB) were removed.`);
    } else {
      this.logger(`${totalCount} folders were removed.`);
    }
  };
}
