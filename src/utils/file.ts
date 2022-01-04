import fs from 'fs';
import fastFolderSizeSync from 'fast-folder-size/sync';

export const readdirSync = (
  path: string,
  options: Parameters<typeof fs.readdirSync>[1]
) => {
  try {
    return fs.readdirSync(path, options);
  } catch (e) {
    if (isErrnoException(e) && e.code === 'EACCES') {
      console.log(`Permission denied for ${path}`);
    } else {
      console.log(e);
    }
    return [];
  }
};

// fs.rmdir will be replaced by fs.rm (>= v14.14.0)
const adapter = {
  rmdirSync: typeof fs.rmSync === 'function' ? fs.rmSync : fs.rmdirSync
};

export const rmdirSync = (path: string, options: fs.RmOptions = {}) => {
  try {
    adapter.rmdirSync(path, options);
    return true;
  } catch (e) {
    if (isErrnoException(e) && e.code === 'EACCES') {
      console.log(`Permission denied for ${path}`);
    } else {
      console.log(e);
    }
    return false;
  }
};

const isErrnoException = (e: unknown): e is NodeJS.ErrnoException => {
  return e instanceof Error && 'code' in e;
};

/** @returns entire size of a directory (MB) */
export const calcDirSizeSync = (path: string) => {
  let bytes;
  try {
    bytes = fastFolderSizeSync(path) || 0;
  } catch (e) {
    bytes = 0;
  }

  return Math.floor(bytes / 1024 / 1024);
};
