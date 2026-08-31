import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { parse } from 'jsonc-parser';

type Theme = { colors: Record<string, string> };

function loadTheme(fileName: string): Theme {
  const filePath = join(__dirname, '..', 'themes', fileName);
  return parse(readFileSync(filePath, 'utf8')) as Theme;
}

function luminance(hex: string): number {
  assert.match(hex, /^#[0-9a-f]{6}$/i, `Expected opaque RGB color, got ${hex}`);
  const channels = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map(value => value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function assertContrast(theme: Theme, foregroundKey: string, backgroundKey: string): void {
  const foreground = theme.colors[foregroundKey];
  const background = theme.colors[backgroundKey];
  assert.ok(foreground, `Missing ${foregroundKey}`);
  assert.ok(background, `Missing ${backgroundKey}`);
  assert.ok(
    contrast(foreground, background) >= 4.5,
    `${foregroundKey} (${foreground}) must have 4.5:1 contrast against ${backgroundKey} (${background})`
  );
}

for (const [name, fileName] of [
  ['light', 'hbuilderx-soft-green-light-color-theme.json'],
  ['dark', 'hbuilderx-soft-green-dark-color-theme.json']
] as const) {
  test(`${name} theme defines readable global and notification text`, () => {
    const theme = loadTheme(fileName);
    for (const key of ['foreground', 'descriptionForeground', 'disabledForeground', 'notifications.foreground']) {
      assert.ok(theme.colors[key], `Missing ${key}`);
    }
    assertContrast(theme, 'notifications.foreground', 'notifications.background');
    assertContrast(theme, 'button.foreground', 'button.background');
    assertContrast(theme, 'button.foreground', 'button.hoverBackground');
  });

  test(`${name} theme tab labels remain readable`, () => {
    const theme = loadTheme(fileName);
    assertContrast(theme, 'tab.activeForeground', 'tab.activeBackground');
    assertContrast(theme, 'tab.hoverForeground', 'tab.hoverBackground');
    assertContrast(theme, 'tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground');
    assertContrast(theme, 'tab.inactiveForeground', 'tab.inactiveBackground');
  });

  test(`${name} theme breadcrumb selection remains readable`, () => {
    const theme = loadTheme(fileName);
    assertContrast(theme, 'breadcrumb.activeSelectionForeground', 'breadcrumb.background');
    assertContrast(theme, 'breadcrumb.focusForeground', 'breadcrumb.background');
  });
}
