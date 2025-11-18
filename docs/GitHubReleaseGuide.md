# GitHub Release Guide

Follow these steps whenever you publish a new version of Helium Translator Inline on GitHub.

## 1. Prepare your workspace

```powershell
cd C:\Users\wesle\Desktop\heliumExtension
```

Ensure all files are saved and the extension works in developer mode.

## 2. Check repository status

```powershell
git status
```

Review the list of modified files. If there are changes you do not want to publish, revert or adjust them before continuing.

## 3. Commit your changes

```powershell
git add .
git commit -m "feat: describe the main change here"
```

Choose a descriptive commit message. Use `git status` again to confirm the working tree is clean.

## 4. Tag the release (optional)

```powershell
git tag v1.0.0
```

Replace `v1.0.0` with the actual version from `manifest.json`. Push tags when you are ready to create a release page.

## 5. Push to GitHub

```powershell
git push origin main
```

If you created a tag:

```powershell
git push origin v1.0.0
```

## 6. Create a GitHub release

1. Open the repository page in your browser.
2. Go to **Releases** → **Draft a new release**.
3. Select the tag (or create one), add release notes, and attach the packaged ZIP if desired.
4. Publish the release.

## 7. Update the Chrome/Edge store links

Once the stores approve the submission, edit the README and documentation to include the live URLs.

## Tips

- Keep the repository free of generated ZIPs or PEM keys. Store them outside the repo.
- Increment `manifest.json`'s version before each public release.
- Use the Chrome Web Store and Edge dashboards to monitor approval status.
- If you maintain multiple branches, replace `main` in the commands with the appropriate branch name.
