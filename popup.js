document.getElementById("viewHistory").addEventListener("click", () => {
  chrome.tabs.create({ 
    url: chrome.runtime.getURL("history.html") 
  }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error("Error opening history tab:", chrome.runtime.lastError);
    }
  });
});
