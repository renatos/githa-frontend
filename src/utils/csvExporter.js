/**
 * Exports a 2D array of rows to a UTF-8 CSV file (with BOM for Excel compatibility).
 * @param {string} filename - Output file name (e.g. 'DRE_10_2026.csv')
 * @param {Array<Array<any>>} rows - 2D array of rows and cells
 */
export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;

  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '';
    const str = String(cell);
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCell).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}
