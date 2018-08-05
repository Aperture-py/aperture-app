import { helper } from '@ember/component/helper';

export function formatBytes([bytes] /*, hash*/) {
  if (bytes == 0) return '0 Bytes';
  if (bytes < 0) return '<0 Bytes';
  let decimals = 2;
  let k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default helper(formatBytes);
