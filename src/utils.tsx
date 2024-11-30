import { Command } from "@tauri-apps/plugin-shell";

/**
 * Extracts the ping time in milliseconds from the given ping text.
 *
 * @param text - The ping text to extract the time from.
 * @returns The ping time in milliseconds, or `null` if the time could not be extracted.
 */
export const extractPingTimeFromPingText = (text: string) => {
  const regex = /time=(\d+)ms/;
  const match = text?.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};

/**
 * Runs a shell command asynchronously.
 *
 * @param name - The name of the command.
 * @param commands - An array of command arguments.
 * @returns A Promise that resolves when the command has finished executing.
 */
export const runCmd = async (name: string, commands: string[]) =>
  await Command.create(name, commands).execute();

/**
 * Parses a string of data into an array of arrays, where each inner array represents a line of data.
 * The function filters out empty lines and lines that contain "-----".
 *
 * @param dataString - The input string of data to be parsed.
 * @returns An array of arrays, where each inner array represents a line of data.
 */
export const parseLinesToObject = (dataString: string) => {
  const lines = dataString
    .split("\n")
    .filter((line) => line.trim() && !line.includes("-----"));

  return lines.slice(1).map((line) => {
    return line.trim().split(/\s{2,}/);
  });
};

/**
 * Extracts IP addresses and checks for the presence of specific words in a given text.
 *
 * @param text - The input text to analyze.
 * @param wordsToCheck - An array of words to check for in the text.
 * @returns An object containing the extracted IP addresses and a mapping of word presence.
 */
export const extractIPsAndWords = (text: string, wordsToCheck: string[]) => {
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
};
