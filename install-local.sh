#!/usr/bin/env bash

set -euo pipefail

UUID="screen-pointer@stepo"
TARGET_DIR="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

mkdir -p "${TARGET_DIR}/schemas"

cp metadata.json "${TARGET_DIR}/"
cp extension.js "${TARGET_DIR}/"
cp prefs.js "${TARGET_DIR}/"
cp schemas/org.gnome.shell.extensions.screen-pointer.gschema.xml "${TARGET_DIR}/schemas/"

glib-compile-schemas "${TARGET_DIR}/schemas"

echo "Installed to ${TARGET_DIR}"
echo "Enable with: gnome-extensions enable ${UUID}"
