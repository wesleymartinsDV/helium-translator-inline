# Helium Translator Inline

Helium Translator Inline is a Chromium-based browser extension that translates entire pages or selected text without disruptive popups. The project started when moving from Microsoft Edge to Helium Browser revealed the lack of a translation flow comparable to Edge’s native feature, so the extension was built to fill that gap—and it works seamlessly in any Chromium browser, including Chrome and Edge. Fast shortcuts keep the workflow fluid while the interface stays clean.

## Features

- Inline translation for full pages and highlighted passages
- Keyboard shortcuts: `Shift + Alt + Q` (selection) and `Shift + Alt + W` (page)
- Minimal popup with light and dark themes
- Favorite languages, quick search, and complete UI localization
- Store metadata localized via `_locales/<lang>/messages.json`

## Installation

### Chrome Web Store (recommended)

1. Visit the Chrome Web Store listing (URL will be published after approval).
2. Click **Add to Chrome** and confirm.

### Microsoft Edge Add-ons

1. Visit the Edge Add-ons listing (URL will be published after approval).
2. Click **Get** and then **Add extension**.

### Manual installation (development build)

1. Clone this repository or download the latest release ZIP.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and choose the project root (`heliumExtension`).
4. Use the refresh icon whenever you change local files.

## Usage

1. Open the popup to choose the target language and manage favorites.
2. Press `Shift + Alt + Q` to translate the current selection; press again to revert.
3. Press `Shift + Alt + W` to translate the entire page; press again to revert.
4. Toggle the theme button to switch between light and dark modes.

## Packaging for Store Submission

1. Increment the version number in `manifest.json` (semantic versioning).
2. Zip the project folder (exclude `.git`, `node_modules`, or private files).
3. Chrome Web Store:
   - Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
   - Create or update the item and upload the ZIP.
   - Provide assets: 1280x800 hero, 440x280 small tile, 128x128 icon, and screenshots (1280x800 recommended).
4. Microsoft Edge Add-ons:
   - Sign in to the [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview).
   - Create or update the submission and upload the same ZIP and assets.
5. Copy the long description, short description, and promotional text from `docs/StoreListing.md`.
6. Host the privacy policy (`docs/PrivacyPolicy.md`) somewhere public (e.g., GitHub Pages) and provide the URL during submission.

## Development

- Popup assets live in `ui/` and shared styles in `css/`.
- `src/background.js` manages keyboard shortcuts; `src/content.js` applies inline translations.
- UI strings are defined in `ui/i18n.js`; store messages mirror them under `_locales/`.
- Preferences persist via `chrome.storage.sync` and are restored on load.
- Use the service worker inspector in `chrome://extensions` to review logs.

## Repository Structure

```text
manifest.json
src/
ui/
css/
icons/
_locales/
docs/
```

## Privacy and Support

- Privacy policy: `docs/PrivacyPolicy.md`
- Contact: `wesleydeveloper@icloud.com`
- GitHub: <https://github.com/wesleymartinsDV/helium-translator-inline>

## License

Select a license before publishing (e.g., MIT). Add the text to a `LICENSE` file and update this section accordingly.
