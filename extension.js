import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const SETTINGS_KEYS = [
    'focus-width',
    'focus-height',
    'dim-opacity',
    'edge-softness',
    'toggle-spotlight',
];

const MODIFIER_TOKENS = [
    ['<Shift>', Clutter.ModifierType.SHIFT_MASK],
    ['<Primary>', Clutter.ModifierType.CONTROL_MASK],
    ['<Ctrl>', Clutter.ModifierType.CONTROL_MASK],
    ['<Control>', Clutter.ModifierType.CONTROL_MASK],
    ['<Alt>', Clutter.ModifierType.MOD1_MASK],
    ['<Super>', Clutter.ModifierType.MOD4_MASK],
];

function _parseModifierMask(accelerator) {
    let mask = 0;

    for (const [token, modifierMask] of MODIFIER_TOKENS) {
        if (accelerator.includes(token))
            mask |= modifierMask;
    }

    return mask;
}

class SpotlightOverlay {
    constructor(settings) {
        this._settings = settings;
        this._monitorSourceId = null;
        this._settingsSignals = [];
        this._pointerX = 0;
        this._pointerY = 0;
        this._modifierMask = 0;
        this._repaintSignalId = 0;

        this._drawingArea = new St.DrawingArea({
            reactive: false,
            visible: false,
            x: 0,
            y: 0,
        });
        this._repaintSignalId = this._drawingArea.connect('repaint', area => this._repaint(area));

        this._settingsSignals = SETTINGS_KEYS.map(key =>
            this._settings.connect(`changed::${key}`, () => {
                this._syncModifierMask();
                this._drawingArea.queue_repaint();
            })
        );

        this._syncModifierMask();
    }

    start() {
        if (this._monitorSourceId !== null)
            return;

        this._monitorSourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
            this._syncState();
            return GLib.SOURCE_CONTINUE;
        });
        GLib.Source.set_name_by_id(this._monitorSourceId, '[screen-pointer] modifier-monitor');
    }

    stop() {
        if (this._monitorSourceId !== null) {
            GLib.source_remove(this._monitorSourceId);
            this._monitorSourceId = null;
        }

        this.hide();
    }

    show() {
        if (!this._drawingArea.get_parent())
            Main.layoutManager.addChrome(this._drawingArea, {affectsInputRegion: false});

        this._drawingArea.visible = true;
    }

    hide() {
        this._drawingArea.visible = false;
    }

    destroy() {
        this.stop();

        this._settingsSignals.forEach(signalId => this._settings.disconnect(signalId));
        this._settingsSignals = [];

        if (this._repaintSignalId !== 0) {
            this._drawingArea.disconnect(this._repaintSignalId);
            this._repaintSignalId = 0;
        }

        this._drawingArea.destroy();
        this._drawingArea = null;
    }

    _syncModifierMask() {
        const accelerator = this._settings.get_strv('toggle-spotlight')[0] ?? '';
        this._modifierMask = _parseModifierMask(accelerator);
    }

    _syncState() {
        if (!this._drawingArea)
            return;

        [this._pointerX, this._pointerY] = global.get_pointer();
        const currentMods = global.get_pointer()[2];
        const isActive = this._modifierMask !== 0 &&
            (currentMods & this._modifierMask) === this._modifierMask;

        if (!isActive) {
            this.hide();
            return;
        }

        if (!this._drawingArea.visible)
            this.show();

        this._syncGeometry();
        this._drawingArea.queue_repaint();
    }

    _syncGeometry() {
        const stageWidth = global.stage.width;
        const stageHeight = global.stage.height;
        this._drawingArea.set_position(0, 0);
        this._drawingArea.set_size(stageWidth, stageHeight);
    }

    _repaint(area) {
        const cr = area.get_context();
        const [surfaceWidth, surfaceHeight] = area.get_surface_size();
        const actorWidth = Math.max(1, area.width);
        const actorHeight = Math.max(1, area.height);
        const scaleX = surfaceWidth / actorWidth;
        const scaleY = surfaceHeight / actorHeight;
        const opacity = Math.max(0, Math.min(100, this._settings.get_int('dim-opacity'))) / 100;
        const outerRadiusX = Math.max(1, this._settings.get_int('focus-width') * scaleX / 2);
        const outerRadiusY = Math.max(1, this._settings.get_int('focus-height') * scaleY / 2);
        const minOuterRadius = Math.max(1, Math.min(outerRadiusX, outerRadiusY));
        const edgeSoftness = Math.max(0, this._settings.get_int('edge-softness')) * Math.min(scaleX, scaleY);
        const featherSize = Math.min(minOuterRadius, edgeSoftness);
        const innerStop = Math.max(0, 1 - featherSize / minOuterRadius);
        const centerX = Math.max(0, Math.min(surfaceWidth, this._pointerX * scaleX));
        const centerY = Math.max(0, Math.min(surfaceHeight, this._pointerY * scaleY));

        cr.setOperator(Cairo.Operator.SOURCE);
        cr.setSourceRGBA(0, 0, 0, opacity);
        cr.paint();

        cr.save();
        cr.translate(centerX, centerY);
        cr.scale(outerRadiusX, outerRadiusY);

        const gradient = new Cairo.RadialGradient(0, 0, 0, 0, 0, 1);
        gradient.addColorStopRGBA(0, 0, 0, 0, 1);
        gradient.addColorStopRGBA(innerStop, 0, 0, 0, 1);
        gradient.addColorStopRGBA(1, 0, 0, 0, 0);

        cr.setOperator(Cairo.Operator.DEST_OUT);
        cr.setSource(gradient);
        cr.arc(0, 0, 1, 0, Math.PI * 2);
        cr.fill();
        cr.restore();
        cr.$dispose();
    }
}

export default class ScreenPointerExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._overlay = new SpotlightOverlay(this._settings);
        this._overlay.start();
    }

    disable() {
        this._overlay?.destroy();
        this._overlay = null;
        this._settings = null;
    }
}
