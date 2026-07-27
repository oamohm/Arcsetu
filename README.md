🌉 GiwaSetu (giwasetu.vercel.app)

> **Decentralized Infrastructure for Programmable Asset Settlement & Cross-Border Payment UX on EVM Networks.**

GiwaSetu is an end-to-end Web3 settlement and identity platform engineered for deterministic execution, cross-border payment UX (Web3 UPI), and verified builder onboarding on GIWA / Sepolia testnet environments[span_0](start_span)[span_0](end_span).

---

## 📌 Production & Deployment Status

* **Live Production URL:** [https://giwasetu.vercel.app](https://giwasetu.vercel.app)[span_1](start_span)[span_1](end_span)
* **Explorer Verification:** Verified transactions on `sepolia-explorer.giwa.io`[span_2](start_span)[span_2](end_span)
* **Network Target:** GIWA Sepolia Testnet (EVM Compatible)[span_3](start_span)[span_3](end_span)
* **CI/CD Pipeline:** Connected to Vercel via automated GitHub deployment hooks[span_4](start_span)[span_4](end_span)

---

## 🏗 System Architecture & End-to-End Flow


```
+-----------------------------------------------------------------------+
|                          USER INTERFACE LAYER                         |
|  Next.js Frontend / React Dashboard / Tailwind CSS Styling             |
|  Hosted on Vercel Edge Network @ https://giwasetu.vercel.app          |
+-----------------------------------------------------------------------+
│
▼
+-----------------------------------------------------------------------+
|                        WEB3 ABSTRACTION LAYER                         |
|  Wagmi Hooks / Viem Engine / Ethers.js Interoperability               |
|  Supported Wallets: MetaMask, Bitget, WalletConnect, Base, Rainbow    |
+-----------------------------------------------------------------------+
│
▼
+-----------------------------------------------------------------------+
|                       SMART CONTRACT LOGIC LAYER                      |
|  EVM Settlement Engine / Identity Registry / Royalty Splitter         |
|  Deterministic State Locks & Verified Dojang SBT Issuance             |
+-----------------------------------------------------------------------+
│
▼
+-----------------------------------------------------------------------+
|                         ON-CHAIN STATE LAYER                          |
|  GIWA Sepolia Network Nodes / Transaction Ledger                      |
|  Verified Block Explorer Verification @ sepolia-explorer.giwa.io     |
+-----------------------------------------------------------------------+
```

---

## 🎯 Core Features & Subsystem Breakdown

### 1. Web3 Identity & Royalties Subsystem
* **Handle Binding Engine:** Binds off-chain handles (e.g., `@Bhupendrxsingh`) directly with public EVM addresses.
* **On-Chain Royalty Allocation:** Enables automatic tracking and distribution of developer/builder royalties upon execution.

### 2. Builder Onboarding Workflow
* **Step 1: Create UFID & Wallet Setup:** Initializes on-chain identity records and connects web3 modal.
* **Step 2: Execute Practice Tx:** Executes gas-optimized test transactions to verify smart contract interaction paths.
* **Step 3: Issue Dojang Stamp:** Mints an immutable Soulbound Token (SBT) confirming builder milestone completion.

### 3. Web3 UPI Payment Rail (Cross-Border UX)
* **Direct Address / UPI Transfer:** Interface allowing instant ETH/Token settlement across addresses.
* **QR Invoice Generator:** Generates dynamic Web3 QR codes for seamless merchant and cross-border billing.
* **INR / KRW FX Calculator:** Live cross-border FX rate estimator for real-time asset conversion visibility.

### 4. Cross-Border Activity Ledger
* **Real-time Logging:** Tracks block numbers, execution status, and transaction hashes directly on-chain.
* **CSV Export Module:** Allows users and auditing teams to export complete transaction logs for reporting.

---

## 📂 Project Structure & Folder Hierarchy


```
giwasetu/
├── .github/                  # GitHub Actions & CI workflows
├── contracts/                # Solidity Smart Contracts
│   ├── GiwaSetuCore.sol      # Main settlement and identity logic
│   └── extensions/           # Modular contract plugins
├── src/
│   ├── components/           # React UI components (Modals, Tables, Forms)
│   ├── config/               # Wagmi, chain & RPC configurations
│   ├── hooks/                # Web3 transaction & wallet hooks
│   ├── modules/              # Modular feature domains (UPI, Onboarding)
│   └── pages/                # Next.js routing and view layers
├── public/                   # Static assets, branding, icons
├── package.json              # Project dependencies & build scripts
├── tsconfig.json             # TypeScript rules & compiler settings
└── README.md                 # Technical & Architecture Blueprint
```

---

## ⚙️ Technical Stack Overview

| Subsystem | Technology | Purpose & Responsibility |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js / React | Server-side rendering, routing, dynamic UI state handling[span_5](start_span)[span_5](end_span) |
| **UI Styling** | Tailwind CSS | Responsive, dark-mode first design architecture[span_6](start_span)[span_6](end_span) |
| **Web3 Wallet Provider** | Wagmi / Viem | EVM RPC abstraction layer and wallet connector state management[span_7](start_span)[span_7](end_span) |
| **Smart Contract Logic** | Solidity | Deterministic execution, state synchronization, token minting[span_8](start_span)[span_8](end_span) |
| **CI/CD & Deployment** | Vercel Pipeline | Automated build pipeline connected to production domain[span_9](start_span)[span_9](end_span) |

---

## 🔌 Extensibility & Modular Plugin Architecture

To add new features in the future without modifying core contract storage or breaking existing UI components, follow the plugin integration pattern[span_10](start_span)[span_10](end_span):

### 1. Smart Contract Extension Hook
Implement external contract modules that inherit access control from the core contract[span_11](start_span)[span_11](end_span):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGiwaSetuExtension {
    function preExecuteHook(address sender, bytes calldata payload) external returns (bool);
    function postExecuteHook(address sender, bytes calldata payload) external returns (bool);
}

contract CustomFeatureExtension is IGiwaSetuExtension {
    function preExecuteHook(address sender, bytes calldata payload) external override returns (bool) {
        // Custom pre-execution logic (e.g., fee checks, access restrictions)
        return true;
    }

    function postExecuteHook(address sender, bytes calldata payload) external override returns (bool) {
        // Custom post-execution logic (e.g., reward distribution)
        return true;
    }
}

```
### 2. Frontend Component Modularization
 * Place new UI feature components under /src/modules/<feature-name>/.
 * Wrap feature states in modular React context providers to avoid global state pollution.
## 🚀 Local Development Setup
```bash
# 1. Clone the repository
git clone [https://github.com/oamohm/giwasetu.git](https://github.com/oamohm/giwasetu.git)

# 2. Enter project directory
cd giwasetu

# 3. Install required node dependencies
npm install

# 4. Launch local development server
npm run dev

```
Open http://localhost:3000 in your browser to view and interact with the dApp.
`
