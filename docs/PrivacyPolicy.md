# Privacy Policy for Helium Translator Inline

Updated: November 17, 2025

Helium Translator Inline ("Extension") is developed and maintained by Wesley Martins ("we", "our", "us"). This privacy policy explains how the Extension handles data when you install and use it in Chromium-based browsers such as Google Chrome or Microsoft Edge.

## Data Collection and Storage

- The Extension does not collect, transmit, or store personal data on external servers.
- Translation requests are executed by the inline translator using the services already available in your browser session. The Extension does not proxy or log the translated content.
- User preferences (theme, favorite languages, selected target language, UI language) are saved locally using `chrome.storage.sync`. This storage is encrypted by the browser and synchronized between your signed-in devices, subject to the browser vendor's policies.

## Permissions Justification

- `activeTab` and `scripting`: required to inject translation scripts into the current tab when you trigger the shortcuts.
- `contextMenus`: used to expose translation actions via the right-click menu.
- `storage`: required to persist your preferences (`chrome.storage.sync`).

The Extension requests only the minimum permissions necessary to provide its functionality.

## Third-Party Services

The Extension does not integrate third-party analytics, advertising, or tracking services. All translation logic executes within the context of the page you are visiting.

## Data Sharing

We do not sell, trade, or otherwise transfer any personal information to outside parties. Browser vendors may access synchronized storage data according to their own privacy policies.

## Security

Because the Extension does not transmit data to external servers, risks are limited to the security of your browser and device. Keep your browser up to date and only install the Extension from trusted sources (Chrome Web Store, Microsoft Edge Add-ons, or the official GitHub repository).

## Children’s Privacy

The Extension is not directed to children under the age of 13. It does not knowingly collect personal information from children.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted in the public repository, and the "Last updated" date will reflect the most recent revision.

## Contact

For questions about this policy or the Extension, contact `wesleydeveloper@icloud.com`.
