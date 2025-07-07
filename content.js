console.log("🛡️ WalletFirewall content.js loaded");

// Inject inject.js into the page
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.type = "text/javascript";
script.onload = () => {
  console.log("🛡️ inject.js loaded successfully");
  script.remove();
};
script.onerror = () => console.error("Failed to load inject.js");
(document.head || document.documentElement).appendChild(script);

// Listen to messages from the page
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  console.log("🛡️ Content script received message:", event.data);

  // Logs all wallet calls
  if (event.data?.type === "wallet_call") {
    console.log("🛡️ Forwarding wallet call to background:", event.data.data);
    chrome.runtime.sendMessage({
      type: "wallet_call",
      data: event.data.data
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending wallet call message:", chrome.runtime.lastError);
      } else {
        console.log("🛡️ Wallet call forwarded successfully");
      }
    });
  }

  // Triggers popup for risky calls
  if (event.data?.type === "risky_call") {
    console.log("🛡️ Forwarding risky call to background:", event.data.data);
    chrome.runtime.sendMessage({
      type: "show_popup",
      data: event.data.data
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending risky call message:", chrome.runtime.lastError);
      } else {
        console.log("🛡️ Risky call forwarded successfully");
      }
    });
  }
});
