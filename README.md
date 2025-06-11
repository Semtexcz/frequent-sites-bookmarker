# Frequent Sites Bookmarker

**Frequent Sites Bookmarker** is a Chrome/Brave extension that automatically bookmarks your most frequently visited websites. It helps you keep your bookmarks bar up to date with the sites you actually use — either automatically or on demand via a popup button.

---

## ✨ Features

- ✅ Automatically identifies and bookmarks your top visited websites.
- ✅ Keeps only one bookmark per domain.
- ✅ Allows manual triggering via popup button.
- ✅ Creates a dedicated folder in the bookmarks bar called `Frequent Sites`.
- ✅ Does not send any browsing data — everything runs locally.

---

## 🔧 Installation

1. Clone or download this repository.
2. Open your browser and go to `chrome://extensions` (or `brave://extensions`).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder where the extension files are located.
6. Done! You should now see the extension in your toolbar.

---

## 🖱️ Usage

- Click the extension icon to open the popup.
- Press the **"Update Bookmarks Now"** button to scan your browsing history and update the bookmark folder.
- A folder named `Frequent Sites` will be created/updated in your bookmarks bar with the top visited pages (one per domain).

---

## ⚙️ Customization

- `MAX_BOOKMARKS` – Limit the number of bookmarks (default: 10).
- `VISIT_THRESHOLD` – Minimum number of visits required for a site to be considered frequent.
- `startTime` (in `background.js`) can be adjusted to filter history by time (e.g., last 7 days).

---

## 🔐 Privacy

This extension **does not collect or transmit** any of your browsing data. All processing happens locally using the browser’s history and bookmarks APIs.

---

## 📁 File Structure

```

frequent-sites-bookmarker/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
└── icon.png

```

---

## 🛠️ Requirements

- Chrome or Brave browser (Manifest V3 compatible)
- Permissions required: `history`, `bookmarks`, `storage`, `scripting`

---

## 📄 License

MIT – Feel free to use, modify, and share.
