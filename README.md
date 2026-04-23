# Screen Pointer Spotlight

GNOME Shell extension for GNOME 46 that dims the entire screen and leaves a configurable area around the mouse pointer visible while a modifier combination is held.

## Features

- Modifier-based activation while the keys are held
- Configurable focus width and height
- Configurable dimming strength
- Configurable soft spotlight edge
- The visible area continuously follows the mouse pointer

## Defaults

- Modifier: `<Super>`
- Focus width: `260`
- Focus height: `180`
- Dimming: `75`
- Edge softness: `56`

## Local Installation

1. Copy the extension to `~/.local/share/gnome-shell/extensions/screen-pointer@stepo`.
2. Compile the schemas inside the extension directory:

```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/screen-pointer@stepo/schemas
```

3. Reload GNOME Shell or log in again.
4. Enable the extension with `gnome-extensions enable screen-pointer@stepo`.

## Development

Open preferences:

```bash
gnome-extensions prefs screen-pointer@stepo
```
