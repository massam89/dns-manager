/* eslint import/prefer-default-export: off */
import { exec } from 'child_process';
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function runCmd(cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

export function parseLinesToObject(dataString: string) {
  const lines = dataString
    .split('\n')
    .filter((line) => line.trim() && !line.includes('-----'));

  return lines.slice(1).map((line) => {
    const columns = line.trim().split(/\s{2,}/);
    return {
      'Admin State': columns[0],
      State: columns[1],
      Type: columns[2],
      'Interface Name': columns[3],
    };
  });
}

export function extractIPsAndWords(text: string, wordsToCheck: string[]) {
  const ipRegex = /\b\d{1,3}(\.\d{1,3}){3}\b/g;
  const ipMatches = text.match(ipRegex) || [];

  const wordPresence: any = {};
  wordsToCheck.forEach((word) => {
    wordPresence[word] = text.includes(word);
  });

  return {
    ipAddresses: ipMatches,
    wordPresence,
  };
}
