import fs from 'fs';
import fastFolderSizeSync from 'fast-folder-size/sync';

export const readdirSync = (
  path: string,
  options: Parameters<typeof fs.readdirSync>[1]
) => {
  try {
    return fs.readdirSync(path, options);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
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
    // TODO: No error is thrown even when file access is denied and file removal is failed.
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(e);
    }
    return false;
  }
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
