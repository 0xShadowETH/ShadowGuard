let lastPopupTime = 0;
const popupCooldown = 8000; // 8 seconds between popups

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("🛡️ Background received message:", message);
  
  if (!message || !message.type) return;

  if (message.type === "wallet_call") {
    const { origin, method, params, timestamp } = message.data;
    console.log("🛡️ Processing wallet call:", method);

    chrome.storage.local.get(["history"], (res) => {
      const history = res.history || {};
      if (!history[origin]) history[origin] = [];
      history[origin].unshift({ method, params, timestamp });
      history[origin] = history[origin].slice(0, 10); // Keep latest 10
      chrome.storage.local.set({ history });
    });
  }

  if (message.type === "show_popup") {
    console.log("🛡️ Show popup message received");
    const now = Date.now();
    if (now - lastPopupTime < popupCooldown) {
      console.log("🛡️ Popup blocked by cooldown");
      return;
    }
    lastPopupTime = now;

    const log = message.data;
    console.log("🛡️ Storing alert data:", log);

    // Store the latest alert in chrome.storage.local
    chrome.storage.local.set({ latestAlert: log }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error storing alert:", chrome.runtime.lastError);
        return;
      }
      
      console.log("🛡️ Alert data stored, waiting before opening popup...");
      
      // Longer delay to let MetaMask popup appear first, then show our alert
      setTimeout(() => {
        // Position in bottom-right corner, away from MetaMask's typical position
        // MetaMask usually appears in center-left, so we position in bottom-right
        const popupWidth = 400;
        const popupHeight = 500;
        const left = 800; // Position further right to avoid MetaMask
        const top = 200; // Position lower to avoid overlap
        
        console.log("🛡️ Creating popup window with position:", { left, top, width: popupWidth, height: popupHeight });
        
        // Open the alert popup
        chrome.windows.create({
          url: chrome.runtime.getURL("alert.html"),
          type: "popup",
          width: popupWidth,
          height: popupHeight,
          top: top,
          left: left,
          focused: true
        }, (window) => {
          if (chrome.runtime.lastError) {
            console.error("Error opening alert popup:", chrome.runtime.lastError);
          } else {
            console.log("🛡️ Alert popup opened successfully at position:", { left, top });
            console.log("🛡️ Popup window info:", window);
          }
        });
      }, 2000); // 2 second delay to let MetaMask appear first
    });
  }
});
