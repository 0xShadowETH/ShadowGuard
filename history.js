// history.js
chrome.storage.local.get(["history"], (res) => {
  if (chrome.runtime.lastError) {
    console.error("Error accessing storage:", chrome.runtime.lastError);
    document.getElementById("historyContainer").innerHTML = "<p class='empty-state'>Error loading history.</p>";
    return;
  }

  const history = res.history || {};
  const container = document.getElementById("historyContainer");

  const entries = Object.entries(history).flatMap(([origin, logs]) =>
    logs.map(log => ({ ...log, origin }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (entries.length === 0) {
    container.innerHTML = "<div class='empty-state'>No wallet activity found yet.<br>All your risky and safe wallet actions will appear here.</div>";
  } else {
    entries.forEach(entry => {
      const div = document.createElement("div");
      div.className = "entry-card";
      const risky = ["eth_sendTransaction", "personal_sign", "eth_sign", "eth_signTypedData"];
      if (risky.includes(entry.method)) div.classList.add("risky");

      let riskBadge = "";
      if (risky.includes(entry.method)) {
        riskBadge = '<span class="risk-badge">RISKY</span>';
      }

      div.innerHTML = `
        <div class="method">🔧 ${entry.method}</div>
        <div class="site">🌐 ${entry.origin}</div>
        <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
        <div class="params">${JSON.stringify(entry.params || [], null, 2)}</div>
        ${riskBadge}
      `;
      container.appendChild(div);
    });
  }
});
