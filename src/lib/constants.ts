const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const CACHE_TIME = {
  STALE_TIME: 5 * MINUTE, // 5 minutes
  GC_TIME: 30 * MINUTE, // 30 minutes
} as const;

export const UI_TIMING = {
  SUCCESS_MESSAGE_DURATION: 3 * SECOND, // 3 seconds
} as const;
