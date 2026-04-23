import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

function _createSpinRow(title, subtitle, settings, key, lower, upper, step) {
    const row = new Adw.ActionRow({title, subtitle});
    const adjustment = new Gtk.Adjustment({
        lower,
        upper,
        step_increment: step,
        page_increment: step * 5,
        value: settings.get_int(key),
    });
    const spin = new Gtk.SpinButton({
        adjustment,
        valign: Gtk.Align.CENTER,
        numeric: true,
    });

    spin.connect('value-changed', widget => {
        settings.set_int(key, widget.get_value_as_int());
    });

    row.add_suffix(spin);
    row.activatable_widget = spin;

    return row;
}

export default class ScreenPointerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        window.set_default_size(680, 420);

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Spotlight',
            description: 'Modifier-Kombination und Größe des ausgesparten Bereichs um den Mauszeiger.',
        });

        const hotkeyRow = new Adw.EntryRow({
            title: 'Modifier',
            text: settings.get_strv('toggle-spotlight')[0] ?? '',
        });
        hotkeyRow.add_suffix(new Gtk.Label({
            label: 'Beispiel: <Super> oder <Ctrl><Alt>',
            valign: Gtk.Align.CENTER,
        }));
        hotkeyRow.connect('changed', widget => {
            const accelerator = widget.text.trim();
            settings.set_strv('toggle-spotlight', accelerator ? [accelerator] : []);
        });

        group.add(hotkeyRow);
        group.add(_createSpinRow(
            'Fokusbreite',
            'Breite des hellen Bereichs in Pixeln.',
            settings,
            'focus-width',
            40,
            2000,
            10
        ));
        group.add(_createSpinRow(
            'Fokushöhe',
            'Höhe des hellen Bereichs in Pixeln.',
            settings,
            'focus-height',
            40,
            2000,
            10
        ));
        group.add(_createSpinRow(
            'Abdunklung',
            '0 = keine Abdunklung, 100 = vollständig schwarz.',
            settings,
            'dim-opacity',
            0,
            100,
            1
        ));
        group.add(_createSpinRow(
            'Kantenweichheit',
            'Breite des weichen Uebergangs in Pixeln.',
            settings,
            'edge-softness',
            0,
            400,
            5
        ));

        group.add(new Adw.ActionRow({
            title: 'Hinweis',
            subtitle: 'Unterstuetzt werden nur Modifier wie <Super>, <Shift>, <Ctrl> und <Alt>.',
        }));

        page.add(group);
        window.add(page);
    }
}
