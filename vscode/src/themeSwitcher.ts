import * as vscode from 'vscode';
import { getConfig, updateConfig } from './configManager';
import { getCurrentSeasonalTimes, parseTime } from './seasonalTimes';
import {
  DARK_THEME,
  LIGHT_THEME,
  ThemeKind,
  needsThemeSwitch,
  shouldBeLightAtTime,
  themeNameFor,
  toggleTarget
} from './themePolicy';

let nextSwitchTimeout: ReturnType<typeof setTimeout> | null = null;

function getConfiguredThemeName(): string {
  return vscode.workspace.getConfiguration('workbench').get<string>('colorTheme') || '';
}

function getActiveThemeKind(): ThemeKind {
  const kind = vscode.window.activeColorTheme.kind;
  return kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast
    ? 'dark'
    : 'light';
}

async function setNativeAutoDetect(enabled: boolean): Promise<void> {
  await vscode.workspace.getConfiguration('window').update(
    'autoDetectColorScheme',
    enabled,
    vscode.ConfigurationTarget.Global
  );
}

async function configureSystemMode(): Promise<void> {
  const workbench = vscode.workspace.getConfiguration('workbench');
  await workbench.update('preferredLightColorTheme', LIGHT_THEME, vscode.ConfigurationTarget.Global);
  await workbench.update('preferredDarkColorTheme', DARK_THEME, vscode.ConfigurationTarget.Global);
  await setNativeAutoDetect(true);
}

export async function switchTheme(kind: ThemeKind): Promise<void> {
  if (!needsThemeSwitch(getConfiguredThemeName(), kind)) {
    return;
  }
  await vscode.workspace.getConfiguration('workbench').update(
    'colorTheme',
    themeNameFor(kind),
    vscode.ConfigurationTarget.Global
  );
}

export async function toggleTheme(): Promise<void> {
  const autoDetect = vscode.workspace.getConfiguration('window').get<boolean>('autoDetectColorScheme') === true;
  const currentThemeName = autoDetect ? '' : getConfiguredThemeName();
  const activeKind = getActiveThemeKind();
  await updateConfig('autoSwitchMode', 'manual');
  await setNativeAutoDetect(false);
  const nextTheme = toggleTarget(currentThemeName, activeKind);
  await switchTheme(nextTheme);
  vscode.window.showInformationMessage(`HBuilderX Soft Green: Switched to ${nextTheme} theme (manual mode)`);
}

export function shouldUseLightThemeNow(now = new Date()): boolean {
  const config = getConfig();

  if (config.autoSwitchMode === 'scheduled') {
    return shouldBeLightAtTime(now, config.lightTime, config.darkTime);
  }
  if (config.autoSwitchMode === 'seasonal') {
    const times = getCurrentSeasonalTimes();
    return shouldBeLightAtTime(now, times.sunrise, times.sunset);
  }
  return getActiveThemeKind() === 'light';
}

export function getNextSwitchTime(now = new Date()): Date {
  const config = getConfig();
  const times = config.autoSwitchMode === 'scheduled'
    ? { sunrise: config.lightTime, sunset: config.darkTime }
    : getCurrentSeasonalTimes();
  const targetTime = shouldUseLightThemeNow(now) ? times.sunset : times.sunrise;
  const parsed = parseTime(targetTime);
  const nextSwitch = new Date(now);
  nextSwitch.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (nextSwitch <= now) {
    nextSwitch.setDate(nextSwitch.getDate() + 1);
  }
  return nextSwitch;
}

export async function startAutoSwitch(): Promise<void> {
  const config = getConfig();
  stopAutoSwitch();

  if (config.autoSwitchMode === 'system') {
    await configureSystemMode();
    return;
  }

  await setNativeAutoDetect(false);
  if (config.autoSwitchMode === 'scheduled' || config.autoSwitchMode === 'seasonal') {
    await applyScheduledTheme();
    scheduleNextSwitch();
  }
}

export function stopAutoSwitch(): void {
  if (nextSwitchTimeout) {
    clearTimeout(nextSwitchTimeout);
    nextSwitchTimeout = null;
  }
}

async function applyScheduledTheme(): Promise<void> {
  const desired: ThemeKind = shouldUseLightThemeNow() ? 'light' : 'dark';
  await switchTheme(desired);
}

function scheduleNextSwitch(): void {
  const delay = Math.max(0, getNextSwitchTime().getTime() - Date.now());
  nextSwitchTimeout = setTimeout(() => {
    void applyScheduledTheme()
      .then(() => {
        const mode = getConfig().autoSwitchMode;
        if (mode === 'scheduled' || mode === 'seasonal') {
          scheduleNextSwitch();
        }
      })
      .catch(reportError);
  }, delay);
}

function reportError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error('HBuilderX Soft Green theme switching failed:', error);
  vscode.window.showErrorMessage(`HBuilderX Soft Green: Theme switching failed: ${message}`);
}

export async function handleConfigChange(): Promise<void> {
  await startAutoSwitch();
}
