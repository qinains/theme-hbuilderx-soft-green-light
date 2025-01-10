# HBuilderX Soft Green Light Theme

The healthiest theme for your eyes!

## SCREENSHOT

Preview
![Screenshot](https://raw.githubusercontent.com/qinains/theme-hbuilderx-soft-green-light/master/images/preview.png)

## Install

You can install this theme through the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=lninl.theme-hbuilderx-soft-green-light).

## Develop

### Find the color

Toggle on "Help -> Toggle Developer Tools".Use the "Select an element in the page to inspect it" tool to find a element, then copy the color value in "HEX" mode.

### Change the color

Search the color in the file "themes/hbuilderx-soft-green-light-color-theme.json" and replace a new color. Uncomment the line. Active "DEBUG AND RUN" toolbar, run the "Extension" to preview the theme.

### Save the theme

"View -> Command Palette...", then type "Developer: Generate  Color Theme From Current Settings". Copy the code and paste the code in "themes/hbuilderx-soft-green-light-color-theme.json" file.

## Publish

```bash
npm install -g @vscode/vsce
vsce login <your-publisher> ## paste "Personal Access Tokens"(https://dev.azure.com/ -> Users settings -> Personal access tokens -> New Token -> type Name -> Organization:All accessible organizations -> Scopes:Full access -> Create)
vsce package
vsce publish
```
