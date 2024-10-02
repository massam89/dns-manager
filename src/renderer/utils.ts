export const debounce = (func: Function, delay: number) => {
  let debounceTimer: any;
  return function debouncedFunction(...args: any) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(args), delay);
  };
};

export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function throttledFunction(...args: any) {
    if (!inThrottle) {
      func.apply(args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const extractTimeFromPingText = (text: string) => {
  const regex = /time=(\d+)ms/;
  const match = text?.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};
