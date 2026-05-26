// src/seasonalTimes.ts

/**
 * Approximate sunrise/sunset times by month (Northern hemisphere, latitude 30-40°)
 * These are rough estimates - exact times require geographic coordinates
 */

export interface TimeConfig {
  sunrise: string;  // HH:MM format
  sunset: string;   // HH:MM format
}

/**
 * Monthly sunrise/sunset table
 * Key: month (1-12)
 */
export const SEASONAL_TIMES: Record<number, TimeConfig> = {
  1:  { sunrise: '07:30', sunset: '17:30' },  // Winter
  2:  { sunrise: '07:00', sunset: '18:00' },
  3:  { sunrise: '06:30', sunset: '18:30' },  // Spring
  4:  { sunrise: '06:00', sunset: '19:00' },
  5:  { sunrise: '05:30', sunset: '19:30' },
  6:  { sunrise: '05:00', sunset: '20:00' },  // Summer
  7:  { sunrise: '05:00', sunset: '20:00' },
  8:  { sunrise: '05:30', sunset: '19:30' },
  9:  { sunrise: '06:00', sunset: '19:00' },  // Autumn
  10: { sunrise: '06:30', sunset: '18:30' },
  11: { sunrise: '07:00', sunset: '18:00' },
  12: { sunrise: '07:30', sunset: '17:30' },  // Winter
};

/**
 * Get current month's sunrise/sunset times
 */
export function getCurrentSeasonalTimes(): TimeConfig {
  const month = new Date().getMonth() + 1;  // getMonth() returns 0-11
  return SEASONAL_TIMES[month] || SEASONAL_TIMES[1];
}

/**
 * Parse HH:MM time string to hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10)
  };
}

/**
 * Validate time string format (HH:MM)
 */
export function validateTimeFormat(timeStr: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
}