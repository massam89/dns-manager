// eslint-disable-next-line import/prefer-default-export
export const extractTimeFromPingText = (text: string) => {
  const regex = /time=(\d+)ms/;
  const match = text?.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};
