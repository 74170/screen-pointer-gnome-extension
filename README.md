# Screen Pointer Spotlight

GNOME-Shell-Extension fuer GNOME 46, die den gesamten Screen abdunkelt und einen konfigurierbaren Bereich um den Mauszeiger frei laesst, solange eine Modifier-Kombination gehalten wird.

## Features

- Modifier-basierte Aktivierung solange die Tasten gehalten werden
- Konfigurierbare Fokusbreite und -hoehe
- Konfigurierbare Abdunklungsstaerke
- Konfigurierbare weiche Spotlight-Kante
- Der ausgesparte Bereich folgt dem Mauszeiger permanent

## Standardwerte

- Modifier: `<Super>`
- Fokusbreite: `260`
- Fokushöhe: `180`
- Abdunklung: `75`
- Kantenweichheit: `56`

## Lokale Installation

1. Extension nach `~/.local/share/gnome-shell/extensions/screen-pointer@stepo` kopieren.
2. Schemas im Extension-Ordner kompilieren:

```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/screen-pointer@stepo/schemas
```

3. GNOME Shell neu laden oder neu anmelden.
4. Extension mit `gnome-extensions enable screen-pointer@stepo` aktivieren.

## Entwicklung

Prefs oeffnen:

```bash
gnome-extensions prefs screen-pointer@stepo
```
