# Development Planning for "Helium Inline Translator" Extension

This document describes the steps to create a web page and text snippet translation extension, focusing on usability and in-page translation.

---

## Changelog / Change History

### v1.1.1 (January 2026) - Major Language Expansion and Improvements

#### New Languages (+11, total: 49):
- 🇪🇪 Eesti (Estonian) - et
- 🇱🇻 Latviešu (Latvian) - lv
- 🇱🇹 Lietuvių (Lithuanian) - lt
- 🇸🇮 Slovenščina (Slovenian) - sl
- 🇷🇸 Српски (Serbian) - sr
- 🇮🇪 Gaeilge (Irish) - ga
- 🇮🇸 Íslenska (Icelandic) - is
- 🇱🇺 Lëtzebuergesch (Luxembourgish) - lb
- 🇲🇹 Malti (Maltese) - mt
- 🇦🇩 Català (Catalan) - ca
- 🇿🇦 Afrikaans - af

#### Translation Fixes for Languages with Special Alphabets:
- **Issue identified**: The batch separator `|||HTSEP|||` was transliterated for non-Latin alphabets:
  - Russian: `|||HTSEP|||` → `|||ХТСЭП|||`
  - Ukrainian: `|||HTSEP|||` → `|||ХЦЕП|||`
  - Serbian: `[-HTS-]` → `[-ХТС-]`
  - Urdu: `|||HTSEP|||` → `||| htsep |||`

- **Solution implemented**: 3-separator system:
  - `|||HTSEP|||` - Default languages (majority)
  - `[-HTS-]` - Russian, Ukrainian, Bulgarian, Gaeilge (ru, uk, bg, ga)
  - `[---]` - Serbian, Urdu (sr, ur)

#### Branding Improvements:
- Renamed from "Inline Translator Helium" to "Helium Inline Translator"
- Contact button changed from email to LinkedIn
- LinkedIn icon using emoji 🔗 (SVG had rendering issues)

#### Files Created/Modified:
- 2 new `_locales/xx/messages.json` files (ga, sr)
- 11 new SVG flags in `icons/flags/`
- `ui/popup.js` - Language list expanded to 49
- `ui/popup.html` - LinkedIn button updated
- `ui/i18n.js` - UI translations for 49 languages
- `src/content.js` - Multiple separator system
- `README.md` - Updated to 49 languages
- `docs/StoreListing.md` - Updated to 49 languages

---

### v1.1.0 (January 2026) - Language Expansion and Fixes

#### Critical Fixes:
- **Translation separator fixed**: The separator `[-HTS-]` was translated by Google Translate (e.g.: `[-高溫超導-]` in Chinese), breaking full page translation. Changed to `|||HTSEP|||` which is preserved.

#### Language Codes:
- Fixed `pt` → `pt_BR` (Chrome didn't recognize generic code)
- Fixed `zh` → `zh_CN` and added `zh_TW` (Chrome requires specific codes)
- Fixed `no` → `nb` (Norwegian Bokmål - correct code for Chrome)

#### Language Expansion (from 19 to 38):
**New languages added:**
- 🇵🇹 Portuguese (Portugal) - pt_PT
- 🇺🇦 Ukrainian - uk
- 🇻🇳 Vietnamese - vi
- 🇮🇩 Indonesian - id
- 🇹🇭 Thai - th
- 🇧🇩 Bengali - bn
- 🇮🇱 Hebrew - he
- 🇮🇷 Persian - fa
- 🇵🇰 Urdu - ur
- 🇬🇷 Greek - el
- 🇨🇿 Czech - cs
- 🇸🇰 Slovak - sk
- 🇭🇺 Hungarian - hu
- 🇷🇴 Romanian - ro
- 🇧🇬 Bulgarian - bg
- 🇭🇷 Croatian - hr
- 🇲🇾 Malay - ms
- 🇵🇭 Filipino - tl

#### Files Created/Modified:
- 18 new `_locales/xx/messages.json` files
- 18 new SVG flags in `icons/flags/`
- `ui/popup.js` - Expanded language list and mappings
- `ui/i18n.js` - UI translations for 38 languages
- `src/content.js` - New translation separator

---

## Phase 1: Project Structure and Configuration

1.  **Project Directory Creation:**
    *   Folder structure: `icons/` (for 16, 48, 128px icons), `ui/` (for popup and translation balloon), `src/` (for scripts).

2.  **Creating `manifest.json`:**
    *   **Name:** Helium Inline Translator (provisional)
    *   **Permissions:**
        *   `contextMenus`: To create right-click menu options.
        *   `activeTab`: To interact with the current page.
        *   `storage`: To save user settings (default target language).
        *   `scripting`: To inject scripts and CSS into the page.
    *   **Background Script:** Register `src/background.js`.
    *   **Content Script:** Register `src/content.js`.
    *   **Action (Popup):** Set `ui/popup.html` as the default popup.
    *   **Icons:** Specify paths to icons.
    *   **Web Accessible Resources:** Declare translation balloon files so they can be injected into the page.

## Phase 2: Context Menu and Background Script

1.  **Background Script Implementation (`src/background.js`):**
    *   **Menu Creation:**
        *   On extension installation (`chrome.runtime.onInstalled`), create two context menus.
        *   Menu 1: "Translate entire page", always visible.
        *   Menu 2: "Translate selected text", visible only when text is selected (`"contexts": ["selection"]`).
    *   **Click Listeners:**
        *   Add `chrome.contextMenus.onClicked` to listen for menu click events.
        *   If "Translate entire page" is clicked, send a message to the active tab's content script.
        *   If "Translate selected text" is clicked, get the text (`info.selectionText`), translate it, and send the result to the content script.
    *   **Translation Logic:**
        *   Implement a `translateText(text, targetLang)` function.
        *   Use a free/public translation API (e.g.: Google Translate via HTTP request, to avoid needing an API key initially).
        *   The function will detect the source language and translate to `targetLang`.
    *   **State Management:**
        *   Listen for messages from popup to update the default target language, saving it with `chrome.storage.sync`.

## Phase 3: Page Interaction (Content Script)

1.  **Content Script Implementation (`src/content.js`):**
    *   **Message Listener:**
        *   Listen for messages from `background.js`.
        *   If receiving an order to "translate entire page":
            *   Traverse the page DOM, identifying text nodes.
            *   Send text batches to `background.js` for translation.
            *   Receive translations and replace text node content.
            *   Observe the DOM (`MutationObserver`) to translate dynamic content.
        *   If receiving an order to "show translation balloon":
            *   Receive the translated text and original text.
            *   Inject an `<iframe>` or `<div>` into the page as the translation balloon.
            *   Populate the balloon with translated text, "Copy" and "Listen" buttons.
            *   Position the balloon near the selected text.
            *   Add logic to close the balloon (click outside, Esc key).

## Phase 4: User Interface (UI)

1.  **Translation Balloon Development (`ui/balloon.html`, `ui/balloon.css`, `ui/balloon.js`):**
    *   **HTML:** Balloon structure with areas for translated text, target language, and buttons.
    *   **CSS:** Modern, non-intrusive styling.
    *   **JS:** Logic for buttons (copy, listen - using `speechSynthesis`).

2.  **Popup Development (`ui/popup.html`, `ui/popup.css`, `ui/popup.js`):**
    *   **HTML:** Target language selector, button to revert page translation.
    *   **JS:**
        *   Load the saved target language from `chrome.storage`.
        *   Save the user's choice to `chrome.storage` when changed.
        *   Implement the "Revert Translation" button logic, which will send a message to the content script.

## Phase 5: Testing and Finalization

1.  **Manual Testing:**
    *   Load the extension in developer mode.
    *   Test on different websites (static and dynamic).
    *   Verify correct context menu creation.
    *   Test snippet and full page translation.
    *   Verify balloon and popup UI and functionality.
    *   Test settings persistence.

2.  **Packaging:**
    *   Create the `.zip` file for distribution.