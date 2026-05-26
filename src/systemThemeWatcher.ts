// src/systemThemeWatcher.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Detect system theme (light or dark)
 * Works on macOS, Windows, and Linux (GNOME)
 */
export async function detectSystemTheme(): Promise<'light' | 'dark'> {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      // macOS: check AppleInterfaceStyle
      const { stdout } = await execAsync('defaults read -g AppleInterfaceStyle 2>/dev/null || echo "Light"');
      return stdout.trim().toLowerCase().includes('dark') ? 'dark' : 'light';
    } else if (platform === 'win32') {
      // Windows: check registry for AppsUseLightTheme
      const { stdout } = await execAsync(
        'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme 2>nul || echo 1'
      );
      // Value 0 = dark, 1 = light
      const match = stdout.match(/AppsUseLightTheme\s+REG_DWORD\s+0x([0-9a-f]+)/i);
      if (match) {
        return match[1] === '0' ? 'dark' : 'light';
      }
      return 'light';
    } else if (platform === 'linux') {
      // Linux GNOME: check GTK theme
      const { stdout } = await execAsync('gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null || echo "light"');
      return stdout.trim().toLowerCase().includes('dark') ? 'dark' : 'light';
    }
  } catch {
    // Detection failed, default to light
    return 'light';
  }

  // Other platforms: default to light
  return 'light';
}