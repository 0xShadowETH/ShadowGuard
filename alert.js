document.addEventListener("DOMContentLoaded", () => {
  console.log("🛡️ Alert popup loaded, fetching data...");
  
  chrome.storage.local.get("latestAlert", (res) => {
    if (chrome.runtime.lastError) {
      console.error("Error accessing storage:", chrome.runtime.lastError);
      document.getElementById("method").innerText = "Error loading alert data";
      return;
    }

    const log = res.latestAlert;
    console.log("🛡️ Retrieved alert data:", log);

    if (!log || !log.method) {
      console.log("🛡️ No alert data found");
      document.getElementById("method").innerText = "No recent alert";
      return;
    }

    console.log("🛡️ Displaying alert data...");

    // Update all the display elements
    document.getElementById("method").innerText = log.method || "N/A";
    document.getElementById("origin").innerText = log.origin || "N/A";
    document.getElementById("timestamp").innerText = log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A";
    document.getElementById("risk_level").innerText = log.risk_level || "Unknown";
    document.getElementById("risk_message").innerText = log.risk_message || "No explanation available.";
    
    // Show amount and recipient if present
    if (log.amount !== undefined && log.amount !== null) {
      document.getElementById("amountSection").style.display = "block";
      document.getElementById("amount").innerText = log.amount + (log.token_type ? ` ${log.token_type}` : "");
    } else {
      document.getElementById("amountSection").style.display = "none";
    }
    if (log.recipient) {
      document.getElementById("recipientSection").style.display = "block";
      document.getElementById("recipient").innerText = log.recipient;
    } else {
      document.getElementById("recipientSection").style.display = "none";
    }
    
    // Format params for better display
    let paramsText = "No parameters";
    if (log.params && log.params.length > 0) {
      try {
        paramsText = JSON.stringify(log.params, null, 2);
      } catch (error) {
        paramsText = "Error formatting parameters";
        console.error("Error formatting params:", error);
      }
    }
    document.getElementById("params").innerText = paramsText;
    
    console.log("🛡️ Alert data displayed successfully");
  });
});
