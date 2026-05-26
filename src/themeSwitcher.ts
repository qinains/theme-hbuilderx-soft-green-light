// src/themeSwitcher.ts

import * as vscode from 'vscode';
import { getConfig } from './configManager';
import { getCurrentSeasonalTimes, parseTime } from './seasonalTimes';
import { detectSystemTheme } from './systemThemeWatcher';

const LIGHT_THEME = 'HBuilderX Soft Green Light';
const DARK_THEME = 'HBuilderX Soft Green Dark';

let checkInterval: ReturnType<typeof setInterval> | null = null;
let nextSwitchTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Switch to specified theme
 */
export async function switchTheme(theme: 'light' | 'dark'): Promise<void> {
  const themeId = theme === 'light' ? LIGHT_THEME : DARK_THEME;
  await vscode.workspace.getConfiguration('workbench').update(
    'colorTheme',
    themeId,
    vscode.ConfigurationTarget.Global
  );
}

/**
 * Toggle between light and dark themes
 */
export async function toggleTheme(): Promise<void> {
  const currentTheme = getCurrentTheme();
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  await switchTheme(nextTheme);
  vscode.window.showInformationMessage(`HBuilderX Soft Green: Switched to ${nextTheme} theme`);
}

/**
 * Get current theme type
 */
export function getCurrentTheme(): 'light' | 'dark' {
  const config = vscode.workspace.getConfiguration('workbench');
  const themeId = config.get<string>('colorTheme') || '';
  return themeId.toLowerCase().includes('dark') ? 'dark' : 'light';
}

/**
 * Determine which theme should be active based on current time
 */
export function shouldUseLightThemeNow(): boolean {
  const config = getConfig();
  const now = new Date();

  if (config.autoSwitchMode === 'scheduled') {
    return shouldBeLightAtTime(now, config.lightTime, config.darkTime);
  } else if (config.autoSwitchMode === 'seasonal') {
    const times = getCurrentSeasonalTimes();
    return shouldBeLightAtTime(now, times.sunrise, times.sunset);
  }

  // For manual and system modes, don't auto-determine
  return getCurrentTheme() === 'light';
}

/**
 * Check if should be light at given time
 */
function shouldBeLightAtTime(now: Date, lightTime: string, darkTime: string): boolean {
  const light = parseTime(lightTime);
  const dark = parseTime(darkTime);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lightMinutes = light.hours * 60 + light.minutes;
  const darkMinutes = dark.hours * 60 + dark.minutes;

  // Light theme between lightTime and darkTime
  if (lightMinutes < darkMinutes) {
    return currentMinutes >= lightMinutes && currentMinutes < darkMinutes;
  } else {
    // Handles case where dark time is before light time (e.g., overnight)
    return currentMinutes >= lightMinutes || currentMinutes < darkMinutes;
  }
}

/**
 * Calculate next switch time
 */
export function getNextSwitchTime(): Date {
  const config = getConfig();
  const now = new Date();

  let lightTime: string;
  let darkTime: string;

  if (config.autoSwitchMode === 'scheduled') {
    lightTime = config.lightTime;
    darkTime = config.darkTime;
  } else if (config.autoSwitchMode === 'seasonal') {
    const times = getCurrentSeasonalTimes();
    lightTime = times.sunrise;
    darkTime = times.sunset;
  } else {
    // No scheduling for manual/system modes
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);  // Default to 24h
  }

  const shouldBeLight = shouldUseLightThemeNow();
  const targetTime = shouldBeLight ? darkTime : lightTime;
  const parsed = parseTime(targetTime);

  const nextSwitch = new Date(now);
  nextSwitch.setHours(parsed.hours, parsed.minutes, 0, 0);

  // If target time already passed today, set for tomorrow
  if (nextSwitch <= now) {
    nextSwitch.setDate(nextSwitch.getDate() + 1);
  }

  return nextSwitch;
}

/**
 * Start auto-switch mechanism
 */
export function startAutoSwitch(): void {
  const config = getConfig();
  stopAutoSwitch();  // Clear any existing timers

  if (config.autoSwitchMode === 'system') {
    startSystemMode();
  } else if (config.autoSwitchMode === 'scheduled' || config.autoSwitchMode === 'seasonal') {
    startScheduledMode();
  }
  // Manual mode: no auto-switch
}

/**
 * Stop auto-switch mechanism
 */
export function stopAutoSwitch(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  if (nextSwitchTimeout) {
    clearTimeout(nextSwitchTimeout);
    nextSwitchTimeout = null;
  }
}

/**
 * System mode: check every 5 minutes
 */
async function startSystemMode(): Promise<void> {
  // Initial check
  const systemTheme = await detectSystemTheme();
  const currentTheme = getCurrentTheme();
  if (systemTheme !== currentTheme) {
    await switchTheme(systemTheme);
  }

  // Poll every 5 minutes
  checkInterval = setInterval(async () => {
    const systemTheme = await detectSystemTheme();
    const currentTheme = getCurrentTheme();
    if (systemTheme !== currentTheme) {
      await switchTheme(systemTheme);
    }
  }, 5 * 60 * 1000);
}

/**
 * Scheduled/Seasonal mode: precise timing
 */
function startScheduledMode(): void {
  // Initial check and switch if needed
  const shouldBeLight = shouldUseLightThemeNow();
  const currentTheme = getCurrentTheme();
  if ((shouldBeLight && currentTheme === 'dark') || (!shouldBeLight && currentTheme === 'light')) {
    switchTheme(shouldBeLight ? 'light' : 'dark');
  }

  // Schedule next switch
  scheduleNextSwitch();
}

/**
 * Schedule next theme switch
 */
function scheduleNextSwitch(): void {
  const nextTime = getNextSwitchTime();
  const now = new Date();
  const delay = nextTime.getTime() - now.getTime();

  nextSwitchTimeout = setTimeout(async () => {
    const shouldBeLight = shouldUseLightThemeNow();
    await switchTheme(shouldBeLight ? 'light' : 'dark');
    scheduleNextSwitch();  // Recursively schedule next
  }, delay);
}

/**
 * Handle configuration changes
 */
export function handleConfigChange(): void {
  const config = getConfig();
  startAutoSwitch();  // Restart with new mode

  if (config.autoSwitchMode === 'scheduled' || config.autoSwitchMode === 'seasonal') {
    // Immediately apply correct theme for current time
    const shouldBeLight = shouldUseLightThemeNow();
    const currentTheme = getCurrentTheme();
    if ((shouldBeLight && currentTheme === 'dark') || (!shouldBeLight && currentTheme === 'light')) {
      switchTheme(shouldBeLight ? 'light' : 'dark');
    }
  }
}