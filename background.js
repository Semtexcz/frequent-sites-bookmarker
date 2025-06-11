const BOOKMARK_FOLDER_NAME = "Frequent Sites";
const MAX_BOOKMARKS = 10;
const VISIT_THRESHOLD = 10;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Frequent Sites Bookmarker installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBookmarks") {
    updateFrequentBookmarks()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true; // keep message channel open for async response
  }
});

/**
 * Extracts the domain name from a given URL.
 * @param {string} url - The URL to extract domain from.
 * @returns {string|null} - The hostname without 'www.', or null on error.
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Retrieves frequently visited sites from browser history.
 * Filters to one URL per domain and limits to MAX_BOOKMARKS entries.
 * @returns {Promise<Array>} - Array of history items.
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
 * Ensures the bookmark folder exists and returns its ID.
 * If it exists, clears its contents.
 * @returns {Promise<string>} - The ID of the folder.
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