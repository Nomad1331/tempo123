/**
 * Get the current date string in the user's configured timezone
 * Format: YYYY-MM-DD
 * 
 * @param timezone - IANA timezone string (defaults to system timezone)
 */
export const getTodayString = (timezone?: string): string => {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};

/**
 * Get a Date object representing the user's current time in their timezone
 */
export const getUserDate = (): Date => {
  return new Date();
};

/**
 * Format a date string to the user's timezone
 */
export const formatDateInUserTimezone = (date: Date, timezone?: string): string => {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};
