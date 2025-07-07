
# 🛡️ ShadowGuard – Web3 Wallet Firewall

ShadowGuard is a browser extension that protects your wallet from malicious, suspicious, and unexpected transaction requests. It analyzes every call (even from trusted sites) and shows you exactly what’s being requested — before you sign anything.

---

## 🔐 Features

- Detects and alerts on risky wallet actions like:
  - `eth_sendTransaction`
  - `personal_sign`
  - `eth_signTypedData`
- Works on trusted and unknown dApps alike
- Transparent review of each transaction
- No data collected — everything runs locally

---

## 🧪 Install in Developer Mode (Chrome)

> For now, ShadowGuard is only available via developer install.

### 1. Clone the Repository

```bash
git clone https://github.com/0xShadowETH/ShadowGuard.git
```

Or [download as ZIP](https://github.com/0xShadowETH/shadowguard/archive/refs/heads/main.zip) and extract it.

### 2. Open Chrome Extensions Page

Go to: `chrome://extensions/`

### 3. Enable Developer Mode

Toggle the **Developer mode** switch in the top-right corner.

### 4. Load Unpacked Extension

Click **“Load unpacked”** and select the `shadowguard` folder (the root folder with `manifest.json` inside).

### 5. Done ✅

ShadowGuard is now active. You’ll see a shield icon in the Chrome toolbar. It will automatically start monitoring any dApp interaction.

---

## 🧠 How It Works

Whenever a site triggers a sensitive wallet action, ShadowGuard intercepts it and shows you a full breakdown before it reaches your wallet — giving you time to review, allow, or ignore.

No more blind signing.

---

## 🧰 Tech Stack

- JavaScript (ES6)
- Chrome Extension APIs
- Web3 Interceptor Hooks

---

## 📢 Coming Soon

- Auto-ban phishing URLs  
- Extension store release  
- Firefox & Brave support  
- AI explanations for contract calls  

---

## 🗣️ Community

Join our Telegram for updates: [Telegram](https://t.me/ZeroXShhadowETH)

---

## 🫡 Made by 0xShadow  
Privacy-first tools for the new internet.
