const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "extension.toml");
const themePath = path.join(root, "themes", "hbuilderx-soft-green.json");

assert.ok(fs.existsSync(manifestPath), "extension.toml must exist");
assert.ok(fs.existsSync(themePath), "Zed theme family must exist");

const manifest = fs.readFileSync(manifestPath, "utf8");
assert.match(manifest, /^id = "hbuilderx-soft-green-theme"$/m);
assert.match(manifest, /^schema_version = 1$/m);

const family = JSON.parse(fs.readFileSync(themePath, "utf8"));
assert.equal(family.$schema, "https://zed.dev/schema/themes/v0.2.0.json");
assert.equal(family.name, "HBuilderX Soft Green");
assert.equal(family.author, "qinains");
assert.equal(family.themes.length, 2);

const light = family.themes.find((theme) => theme.appearance === "light");
const dark = family.themes.find((theme) => theme.appearance === "dark");
assert.equal(light.name, "HBuilderX Soft Green Light");
assert.equal(dark.name, "HBuilderX Soft Green Dark");

assert.equal(light.style.background, "#fffae8");
assert.equal(light.style["elevated_surface.background"], "#fffae8");
assert.equal(light.style["editor.background"], "#fffae8");
assert.equal(light.style["editor.gutter.background"], "#fffae8");
assert.equal(light.style["terminal.background"], "#fffae8");
assert.equal(light.style["terminal.ansi.background"], "#fffae8");
assert.equal(light.style["terminal.ansi.black"], "#fffae8");
assert.equal(light.style.accent, "#41a863");
assert.equal(light.style["title_bar.background"], "#fffae8");
assert.equal(light.style["toolbar.background"], "#fffae8");
assert.equal(light.style["tab_bar.background"], "#fffae8");
assert.equal(light.style["panel.background"], "#fffae8");
assert.equal(dark.style["editor.background"], "#1e2419");
assert.equal(dark.style.accent, "#4ade80");
assert.equal(dark.style["title_bar.background"], "#1e2419");
assert.equal(dark.style["panel.background"], "#1e2419");
assert.equal(dark.style["tab.active_background"], "#2f5d3a");
assert.equal(dark.style["minimap.thumb.background"], "#4ade8033");
assert.equal(dark.style["scrollbar.thumb.background"], "#4ade8026");
assert.equal(dark.style["scrollbar.thumb.hover_background"], "#4ade8040");
assert.equal(dark.style["version_control.word_added"], "#22c55e33");
assert.equal(dark.style["editor.diff_hunk.added.background"], "#15371f");
assert.equal(dark.style["editor.diff_hunk.deleted.background"], "#3b1e1e");

for (const theme of [light, dark]) {
  assert.ok(Object.keys(theme.style).length >= 90, `${theme.name} must cover the Zed UI`);
  assert.ok(Object.keys(theme.style.syntax).length >= 25, `${theme.name} must cover syntax captures`);
  for (const key of [
    "background",
    "text",
    "editor.foreground",
    "editor.background",
    "terminal.background",
    "terminal.ansi.red",
    "version_control.added",
    "error",
  ]) {
    assert.ok(key in theme.style, `${theme.name} is missing ${key}`);
  }
}

console.log("Zed theme structure and palette checks passed");
