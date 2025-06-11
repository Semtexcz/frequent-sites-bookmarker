/**
 * popup.js
 *
 * Handles the user interaction in the popup of the Chrome extension.
 * - Waits for the popup DOM to load.
 * - Attaches a click listener to the "Update" button.
 * - When clicked, it sends a message to the background script to update bookmarks.
 * - Displays status messages based on the result of the operation.
 */

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const button = document.getElementById("update");

  // Attach click listener to the "Update" button
  button.addEventListener("click", () => {
    status.textContent = "Updating...";

    // Send message to background script to trigger bookmark update
    chrome.runtime.sendMessage({ action: "updateBookmarks" }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = "Error: " + chrome.runtime.lastError.message;
        return;
      }
      if (response && response.success) {
        status.textContent = "Bookmarks updated!";
      } else {
        status.textContent = "Error: " + (response?.error || "Unknown error");
      }
    });
  });
});
