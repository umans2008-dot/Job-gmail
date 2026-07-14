/**
 * Utility to export data to a CSV file.
 * Automatically adds UTF-8 BOM so Microsoft Excel can display Indonesian characters correctly.
 */
export const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
  const escapeField = (field: any) => {
    if (field === null || field === undefined) return '';
    const stringified = String(field);
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
  };

  const csvContent = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
