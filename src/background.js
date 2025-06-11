const BOOKMARK_FOLDER_NAME = "Frequent Sites";
let MAX_BOOKMARKS = 10;
const VISIT_THRESHOLD = 10;

chrome.storage.sync.get(["maxBookmarks"], (result) => {
  if (result.maxBookmarks) {
    MAX_BOOKMARKS = result.maxBookmarks;
  }
});

/**
 * Extracts the domain name from a given URL, stripping the 'www.' prefix.
 *
 * @param {string} url - The full URL to parse.
 * @returns {string|null} - The domain name without 'www.', or null if parsing fails.
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Retrieves the most frequently visited sites from the browser history.
 * Filters entries to only include unique domains and returns the top N.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of unique,
 *                             frequently visited history items (up to MAX_BOOKMARKS).
 */
async function getTopFrequentSites() {
  const historyItems = await chrome.history.search({ text: "", maxResults: 1000 });
  const frequentItems = historyItems.filter(item => item.visitCount >= VISIT_THRESHOLD);
  frequentItems.sort((a, b) => b.visitCount - a.visitCount);

  const domainMap = new Map();
  for (const item of frequentItems) {
    const domain = extractDomain(item.url);
    if (domain && !domainMap.has(domain)) {
      domainMap.set(domain, item);
    }
    if (domainMap.size >= MAX_BOOKMARKS) break;
  }
  return Array.from(domainMap.values());
}

/**
 * Finds or creates the "Frequent Sites" bookmark folder.
 * If the folder exists, removes all existing bookmarks inside it.
 *
 * @returns {Promise<string>} - A promise that resolves to the ID of the target bookmark folder.
 */
async function prepareBookmarkFolder() {
  const folders = await chrome.bookmarks.search({ title: BOOKMARK_FOLDER_NAME });
  if (folders.length === 0) {
    const folder = await chrome.bookmarks.create({ parentId: "1", title: BOOKMARK_FOLDER_NAME });
    return folder.id;
  } else {
    const folderId = folders[0].id;
    const children = await chrome.bookmarks.getChildren(folderId);
    for (const child of children) {
      await chrome.bookmarks.remove(child.id);
    }
    return folderId;
  }
}

/**
 * Creates new bookmarks for the given list of history items inside the specified folder.
 *
 * @param {string} folderId - The ID of the target bookmark folder.
 * @param {Array<Object>} items - An array of history items to bookmark.
 * @returns {Promise<void>}
 */
async function createBookmarks(folderId, items) {
  for (const item of items) {
    await chrome.bookmarks.create({ parentId: folderId, title: item.title, url: item.url });
  }
}

/**
 * Updates the "Frequent Sites" bookmark folder with the current top visited unique domains.
 * Combines steps: retrieve history, prepare folder, and create bookmarks.
 *
 * @returns {Promise<void>}
 */
async function updateFrequentBookmarks() {
  const { maxBookmarks } = await chrome.storage.sync.get(["maxBookmarks"]);
  if (maxBookmarks) MAX_BOOKMARKS = maxBookmarks;

  const topItems = await getTopFrequentSites();
  const folderId = await prepareBookmarkFolder();
  await createBookmarks(folderId, topItems);
  console.log("Frequent sites updated.");
}

// Expose updateFrequentBookmarks for runtime usage
self.updateFrequentBookmarks = updateFrequentBookmarks;

// Initialization: log when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Frequent Sites Bookmarker installed.");
  updateFrequentBookmarks();
  chrome.alarms.create("autoUpdate", { periodInMinutes: 60 });
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Frequent Sites Bookmarker started with browser.");
  updateFrequentBookmarks();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoUpdate") {
    console.log("Auto update triggered.");
    updateFrequentBookmarks();
  }
});

// Listen for runtime messages to trigger bookmark update
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBookmarks") {
    updateFrequentBookmarks()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.toString() }));
    return true;
  }
  if (request.action === "setMaxBookmarks") {
    chrome.storage.sync.set({ maxBookmarks: request.value }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
