import { Command } from "@tauri-apps/plugin-shell";

export const extractTimeFromPingText = (text: string) => {
  const regex = /time=(\d+)ms/;
  const match = text?.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};

export const runCmd = async (name: string, commands: string[]) =>
  await Command.create(name, commands).execute();

export function parseLinesToObject(dataString: string) {
  const lines = dataString
    .split("\n")
    .filter((line) => line.trim() && !line.includes("-----"));

  return lines.slice(1).map((line) => {
    return line.trim().split(/\s{2,}/);
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
