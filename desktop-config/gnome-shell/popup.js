'use strict';

const { St, Shell } = imports.gi;
const Main = imports.ui.main;

/// Blurs the background behind panel popup menus (calendar, system menu,
/// app menu) by inserting a blurred widget below the popup while it is open.
var PopupBlur = class PopupBlur {
    constructor(connections, prefs) {
        this.connections = connections;
        this.prefs = prefs;
        this.entries = [];   // { menu, popup, background, blur }
        this.enabled = false;
    }

    enable() {
        if (this.enabled)
            return;
        this.enabled = true;

        const buttons = [
            Main.panel.statusArea.appMenu,
            Main.panel.statusArea.dateMenu,
            Main.panel.statusArea.aggregateMenu
        ];

        buttons.forEach(button => {
            if (!button || !button.menu)
                return;
            this.connections.connect(
                button.menu,
                'open-state-changed',
                (menu, open) => {
                    if (open)
                        this._on_open(menu);
                    else
                        this._on_close(menu);
                }
            );
        });
    }

    _entry_for(menu) {
        return this.entries.find(e => e.menu === menu) || null;
    }

    _on_open(menu) {
        try {
            if (this._entry_for(menu))
                return;

            let popup = menu.actor;
            let background = new St.Widget({
                name: 'popup-blurred-background',
                reactive: false
            });

            let blur = new Shell.BlurEffect({
                brightness: 1.0,
                sigma: 30,
                mode: Shell.BlurMode.BACKGROUND
            });
            background.add_effect(blur);

            let parent = popup.get_parent();
            parent.insert_child_below(background, popup);

            let entry = { menu, popup, background, blur };
            this.entries.push(entry);

            this._update_geometry(entry);
            this.connections.connect(popup, 'notify::position',
                () => this._update_geometry(entry));
            this.connections.connect(popup, 'notify::size',
                () => this._update_geometry(entry));
        } catch (e) {
            log(`[popup-blur] error: ${e}`);
        }
    }

    _update_geometry(entry) {
        let [x, y] = entry.popup.get_transformed_position();
        let [w, h] = entry.popup.get_size();
        let inset = 10;
        let top = 22;   // 顶部留出箭头
        entry.background.set_position(x + inset, y + top);
        entry.background.set_size(
            Math.max(w - inset * 2, 1),
            Math.max(h - top - inset, 1)
        );
    }

    _on_close(menu) {
        let entry = this._entry_for(menu);
        if (!entry)
            return;

        this.connections.disconnect_all_for(entry.popup);
        try {
            entry.background.get_parent().remove_child(entry.background);
        } catch (e) { }

        this.entries.splice(this.entries.indexOf(entry), 1);
    }

    disable() {
        this.entries.forEach(entry => {
            try {
                entry.background.get_parent().remove_child(entry.background);
            } catch (e) { }
        });
        this.entries = [];
        this.connections.disconnect_all();
        this.enabled = false;
    }
};
