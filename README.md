# 🌉 ArcSetu (`arcsetu.vercel.app`)

> **Programmable USDC Settlement Engine & Cross-Chain Payment Bridge on Arc Network.**

ArcSetu serves as a native Web3 payment bridge connecting users, merchants, and liquidity vaults with sub-second finality.

---

## 📌 Production & Deployment Status

* **Live Production URL:** [https://arcsetu.vercel.app](https://arcsetu.vercel.app)
* **Explorer Verification:** Verified transactions on [testnet.arcscan.app](https://testnet.arcscan.app)
* **Network Target:** Arc Testnet (Chain ID: `5042002`)
* **Settlement Token:** Native USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`)
* **CI/CD Pipeline:** Connected to Vercel via automated GitHub deployment hooks

---

## 🌉 System Architecture & End-to-End Flow

<pre>
+-----------------------------------------------------------------------+
|                          USER INTERFACE LAYER                         |
|  Next.js Dashboard / Tailwind CSS / Multi-Language i18n Engine        |
|  Hosted on Vercel Edge Network @ https://arcsetu.vercel.app           |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                        WEB3 ABSTRACTION LAYER                         |
|  Wagmi Hooks / Viem Engine / RainbowKit Wallet Connector              |
|  HTML5 Camera POS Scanner & Dynamic Invoice Generator                 |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                       SMART CONTRACT LOGIC LAYER                      |
|  Arc Native Settlement Engine / Arc UP Handle Resolver Registry       |
|  Programmable Revenue Splitter (80/15/5) / Treasury Yield Vault       |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                         ON-CHAIN STATE LAYER                          |
|  Arc Testnet Consensus Engine / Circle CCTP Routing Bridge            |
|  Sub-Second Finality Ledger & ArcScan Explorer Verification           |
+-----------------------------------------------------------------------+
</pre>
