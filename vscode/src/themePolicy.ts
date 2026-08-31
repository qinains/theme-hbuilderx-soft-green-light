import { parseTime } from './seasonalTimes';

export type ThemeKind = 'light' | 'dark';

export const LIGHT_THEME = 'HBuilderX Soft Green Light';
export const DARK_THEME = 'HBuilderX Soft Green Dark';

export function themeNameFor(kind: ThemeKind): string {
  return kind === 'light' ? LIGHT_THEME : DARK_THEME;
}

export function needsThemeSwitch(currentThemeName: string, desiredKind: ThemeKind): boolean {
  return currentThemeName !== themeNameFor(desiredKind);
}

export function toggleTarget(currentThemeName: string, activeKind: ThemeKind): ThemeKind {
  if (currentThemeName === LIGHT_THEME) {
    return 'dark';
  }
  if (currentThemeName === DARK_THEME) {
    return 'light';
  }
  return activeKind === 'dark' ? 'light' : 'dark';
}

export function shouldBeLightAtTime(now: Date, lightTime: string, darkTime: string): boolean {
  const light = parseTime(lightTime);
  const dark = parseTime(darkTime);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lightMinutes = light.hours * 60 + light.minutes;
  const darkMinutes = dark.hours * 60 + dark.minutes;

  if (lightMinutes < darkMinutes) {
    return currentMinutes >= lightMinutes && currentMinutes < darkMinutes;
  }
  return currentMinutes >= lightMinutes || currentMinutes < darkMinutes;
}
