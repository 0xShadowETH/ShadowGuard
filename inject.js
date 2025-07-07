(function () {
  const originalRequest = window.ethereum?.request;
  if (!originalRequest) {
    console.log("🛡️ No ethereum provider found on this page");
    return;
  }

  console.log("🛡️ ShadowGuard inject.js loaded, intercepting wallet calls...");

  const METHOD_RISK_MAP = {
    eth_sendTransaction: {
      level: "high",
      message: "This method can send ETH or tokens out of your wallet.",
    },
    personal_sign: {
      level: "medium",
      message: "This method signs a message that could be used in phishing attacks.",
    },
    eth_sign: {
      level: "high",
      message: "This method signs raw data and is extremely dangerous if misused.",
    },
    eth_signTypedData: {
      level: "high",
      message: "This method can stealthily approve token transfers.",
    },
    eth_signTypedData_v4: {
      level: "high",
      message: "This method can stealthily approve token transfers (v4 format).",
    },
    wallet_switchEthereumChain: {
      level: "low",
      message: "This method switches your wallet to a different blockchain.",
    },
    wallet_addEthereumChain: {
      level: "low",
      message: "This method adds a new blockchain network to your wallet.",
    }
  };

  // Helper: parse hex to decimal string
  function hexToDecimalString(hex) {
    if (!hex) return "0";
    return parseInt(hex, 16).toString();
  }

  // Helper: parse ERC20 transfer/approve data
  function parseERC20Data(data) {
    if (!data || data.length < 10) return null;
    const methodID = data.slice(0, 10);
    // ERC20 transfer(address,uint256): a9059cbb
    // ERC20 approve(address,uint256): 095ea7b3
    // ERC20 transferFrom(address,uint256): 23b872dd
    if (["0xa9059cbb", "0x095ea7b3", "0x23b872dd"].includes(methodID)) {
      // All have address (32 bytes) + amount (32 bytes)
      const to = "0x" + data.slice(34, 74);
      const amountHex = "0x" + data.slice(74, 138);
      return {
        methodID,
        to,
        amount: hexToDecimalString(amountHex)
      };
    }
    return null;
  }

  // 🔍 Decode known contract methods from tx.data
  function decodeTxIntent(tx) {
    try {
      const methodID = tx?.data?.slice(0, 10); // first 4 bytes
      const knownMethods = {
        // Uniswap & swaps
        "0x7ff36ab5": "Uniswap: swapExactETHForTokens",
        "0x38ed1739": "Uniswap: swapExactTokensForETH",
        "0x18cbafe5": "Uniswap: swapExactTokensForTokens",
        "0x5c11d795": "Uniswap: swapTokensForExactETH",
        "0x4a25d94a": "Uniswap: swapETHForExactTokens",

        // ERC20 transfers/approvals
        "0xa9059cbb": "ERC20: transfer(address,uint256)",
        "0x095ea7b3": "ERC20: approve(address,uint256)",
        "0x23b872dd": "ERC20/ERC721: transferFrom",

        // NFT transfers
        "0x42842e0e": "ERC721: safeTransferFrom",

        // Permits
        "0xd505accf": "EIP-2612: permit",
        "0x8fcbaf0c": "DAI-style permit",

        // DeFi lending
        "0xd0e30db0": "DeFi: deposit ETH",
        "0x2e1a7d4d": "DeFi: withdraw ETH",
        "0xa0712d68": "DeFi: repay debt",
        "0x3b3b57de": "DeFi: borrow",

        // Suspicious patterns
        "0x9dc29fac": "Suspicious: drainer-like max approval",
        "0x372500ab": "Suspicious: fake staking contract"
      };

      return knownMethods[methodID] || null;
    } catch (error) {
      console.error("Error decoding transaction intent:", error);
      return null;
    }
  }

  window.ethereum.request = async function (args) {
    try {
      const method = args?.method;
      const params = args?.params || [];

      console.log("🛡️ Intercepted wallet call:", method, params);

      const log = {
        origin: window.location.hostname,
        method,
        params,
        timestamp: new Date().toISOString(),
      };

      // Always log all wallet calls
      window.postMessage({ type: "wallet_call", data: log }, "*");

      if (method === "eth_sendTransaction" && params.length > 0) {
        const tx = params[0];
        const value = parseInt(tx.value || "0x0", 16);
        const isEthSend = value > 0;
        const erc20 = parseERC20Data(tx.data);
        let shouldFlag = false;
        let contextMessage = "";
        let amount = null;
        let recipient = null;
        let tokenType = null;

        if (isEthSend) {
          shouldFlag = true;
          amount = value / 1e18;
          recipient = tx.to;
          tokenType = "ETH";
          contextMessage = `This transaction is sending ${amount} ETH to ${recipient}. Make sure this is correct.`;
        } else if (erc20) {
          shouldFlag = true;
          amount = erc20.amount;
          recipient = erc20.to;
          tokenType = "ERC20";
          contextMessage = `This transaction is sending ${amount} tokens (ERC20) to ${recipient}. Confirm this is what you intended.`;
        }

        if (shouldFlag) {
          const alertData = {
            ...log,
            risk_level: "high",
            risk_message: contextMessage,
            amount,
            recipient,
            token_type: tokenType
          };
          console.log("🛡️ Sending risky call alert:", alertData);
          window.postMessage(
            {
              type: "risky_call",
              data: alertData,
            },
            "*"
          );
        }
        // If not flagged, just proceed
        return originalRequest.apply(this, arguments);
      }

      // Other risky methods (signing, etc.)
      if (METHOD_RISK_MAP[method] && method !== "eth_sendTransaction") {
        const riskInfo = METHOD_RISK_MAP[method];
        const contextMessage = riskInfo.message;
        const alertData = {
          ...log,
          risk_level: riskInfo.level,
          risk_message: contextMessage,
        };
        window.postMessage(
          {
            type: "risky_call",
            data: alertData,
          },
          "*"
        );
      }

      return originalRequest.apply(this, arguments);
    } catch (error) {
      console.error("Error in ethereum.request interceptor:", error);
      // Fallback to original request
      return originalRequest.apply(this, arguments);
    }
  };
})();
