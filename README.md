# HBuilderX Soft Green Theme

The healthiest theme for your eyes!

## Screenshot

Preview
![Screenshot](https://raw.githubusercontent.com/qinains/theme-hbuilderx-soft-green-light/master/images/preview.png)

## Features

- **Two themes**: Light and Dark variants
- **Auto-switch**: System, Scheduled, Seasonal, Manual modes
- **Default**: Follows OS theme automatically

## Install

Install from [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=lninl.theme-hbuilderx-soft-green-light).

### Zed

The repository also includes native Zed light and dark variants. To install them
locally while developing:

1. Open the command palette in Zed.
2. Run `zed: install dev extension`.
3. Select this repository directory.
4. Choose `HBuilderX Soft Green Light` or `HBuilderX Soft Green Dark` from the
   theme selector.

To follow the operating system appearance automatically, use:

```json
{
  "theme": {
    "mode": "system",
    "light": "HBuilderX Soft Green Light",
    "dark": "HBuilderX Soft Green Dark"
  }
}
```

## Usage

### Quick Toggle

Click status bar `$(color-mode)` icon, or run:
- `Toggle Theme (Light/Dark)`

### Auto-Switch Settings

Settings (Cmd+,) → search "HBuilderX Soft Green":

| Setting | Description | Default |
|---------|-------------|---------|
| `autoSwitchMode` | System/Scheduled/Seasonal/Manual | `system` |
| `lightTime` | Light theme time (HH:MM) | `07:00` |
| `darkTime` | Dark theme time (HH:MM) | `19:00` |

## Develop

### Find color

Help → Toggle Developer Tools → Select element → Copy HEX color.

### Change color

Edit `themes/hbuilderx-soft-green-light-color-theme.json` or `themes/hbuilderx-soft-green-dark-color-theme.json`. Run "Extension" in DEBUG toolbar.

### Save theme

Command Palette → `Developer: Generate Color Theme From Current Settings`.

### Build

```bash
npm install
npm run compile
npm run package
```

Validate the Zed theme:

```bash
npm run test:zed
```

## Publish

```bash
npm install -g @vscode/vsce
vsce login <your-publisher> ## paste "Personal Access Tokens"(https://dev.azure.com/ -> Users settings -> Personal access tokens -> New Token -> type Name -> Organization:All accessible organizations -> Scopes:Full access -> Create)
vsce package
vsce publish
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
