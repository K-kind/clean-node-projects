import columnify from 'columnify';

export type Directory = {
  path: string;
  lastAccessedAt: string;
  megaBytes: number;
};

export const toFormattedRows = (directories: Directory[]) => {
  const columnifiedStr = toColumnifiedString(directories);
  return toHeaderAndRows(columnifiedStr);
};

const HEADER1 = 'PATH';
const DELIMITER = ':::::';
const SPACE = '     ';

/**
 * returns
 * `HEADER1       HEADER2       HEADER3
 *  data1          data2         data3
 *  longlonglo..   data2         data3
 *  nglonglong                         `
 */
const toColumnifiedString = (directories: Directory[]) => {
  return columnify(directories, {
    maxWidth: 80,
    config: {
      path: {
        headingTransform: () => HEADER1,
        dataTransform: (path) => `${DELIMITER}${path}${SPACE}`
      },
      lastAccessedAt: {
        headingTransform: () => 'LAST ACCESS',
        align: 'center'
      },
      megaBytes: {
        headingTransform: () => 'SIZE',
        dataTransform: (megaBytes) => `${megaBytes}MB`,
        align: 'right'
      }
    }
  });
};

/**
 * returns
 * {
 *   header: 'HEADER1       HEADER2       HEADER3',
 *   rows: [
 *     'data1          data2         data3 ',
 *     `longlonglo..   data2         data3
 *      nglonglong                         `
 *   ]
 * }
 */
const toHeaderAndRows = (columnifiedStr: string) => {
  const [headerWithExtraSpace, ...separatedRows] = columnifiedStr.split('\n');
  const header = HEADER1 + headerWithExtraSpace.slice((HEADER1 + SPACE).length);

  const rows: string[] = [];
  separatedRows.forEach((row) => {
    if (row.startsWith(DELIMITER)) {
      rows.push(row.slice(DELIMITER.length));
    } else {
      rows[rows.length - 1] += `\n   ${row}`;
    }
  });

  return { header, rows };
};
