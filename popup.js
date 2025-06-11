document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("update").addEventListener("click", () => {
        const status = document.getElementById("status");
        status.textContent = "Updating...";
        chrome.runtime.sendMessage({ action: "updateBookmarks" }, (response) => {
            if (response.success) {
                status.textContent = "Bookmarks updated!";
            } else {
                status.textContent = "Error: " + response.error;
            }
        });
    });
});
