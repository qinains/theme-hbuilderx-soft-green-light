// src/extension.ts

import * as vscode from 'vscode';
import {
  getConfig,
  setMode,
  setLightTime,
  setDarkTime
} from './configManager';
import {
  toggleTheme,
  startAutoSwitch,
  stopAutoSwitch,
  handleConfigChange
} from './themeSwitcher';

let statusBar: vscode.StatusBarItem;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('HBuilderX Soft Green Theme extension activated');

  // Create status bar button for manual toggle
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.command = 'hbuilderxSoftGreen.toggleTheme';
  statusBar.text = '$(color-mode)';
  statusBar.tooltip = 'Toggle HBuilderX Soft Green Theme (Light/Dark)';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Register commands
  registerCommands(context);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('hbuilderxSoftGreen')) {
        handleConfigChange();
      }
    })
  );

  // Start auto-switch based on current config
  const config = getConfig();
  startAutoSwitch();

  // If scheduled or seasonal mode, immediately check and apply correct theme
  if (config.autoSwitchMode === 'scheduled' || config.autoSwitchMode === 'seasonal') {
    handleConfigChange();
  }
}

/**
 * Register all commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Toggle theme
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.toggleTheme', toggleTheme)
  );

  // Set mode commands
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setModeSystem', () => setMode('system'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setModeScheduled', () => setMode('scheduled'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setModeSeasonal', () => setMode('seasonal'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setModeManual', () => setMode('manual'))
  );

  // Set time commands
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setLightTime', setLightTime)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('hbuilderxSoftGreen.setDarkTime', setDarkTime)
  );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  stopAutoSwitch();
  if (statusBar) {
    statusBar.dispose();
  }
  console.log('HBuilderX Soft Green Theme extension deactivated');
}