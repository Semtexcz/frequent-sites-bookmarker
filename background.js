const BOOKMARK_FOLDER_NAME = "Frequent Sites";
const MAX_BOOKMARKS = 10;
const VISIT_THRESHOLD = 10;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Frequent Sites Bookmarker installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateBookmarks") {
        updateFrequentBookmarks().then(() => sendResponse({ success: true })).catch(err => sendResponse({ success: false, error: err }));
        return true; // keep message channel open for async response
    }
});

function extractDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
}

async function updateFrequentBookmarks() {
    const historyItems = await chrome.history.search({ text: "", maxResults: 1000 });
    const frequentItems = historyItems.filter(item => item.visitCount >= VISIT_THRESHOLD);
    frequentItems.sort((a, b) => b.visitCount - a.visitCount);

    // Unikátní položky podle domény
    const domainMap = new Map();
    for (const item of frequentItems) {
        const domain = extractDomain(item.url);
        if (domain && !domainMap.has(domain)) {
            domainMap.set(domain, item);
        }
        if (domainMap.size >= MAX_BOOKMARKS) break;
    }
    const topItems = Array.from(domainMap.values());

    const folders = await chrome.bookmarks.search({ title: BOOKMARK_FOLDER_NAME });
    let folderId;
    if (folders.length === 0) {
        const folder = await chrome.bookmarks.create({ parentId: "1", title: BOOKMARK_FOLDER_NAME });
        folderId = folder.id;
    } else {
        folderId = folders[0].id;
        const children = await chrome.bookmarks.getChildren(folderId);
        for (const child of children) {
            await chrome.bookmarks.remove(child.id);
        }
    }

    for (const item of topItems) {
        await chrome.bookmarks.create({ parentId: folderId, title: item.title, url: item.url });
    }
    console.log("Frequent sites updated.");
}
