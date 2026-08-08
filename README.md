Arcsetu
programmable usdc settlement engine & cross-chain payment bridge on arc network.

arcsetu is a native web3 payment bridge designed for sub-second settlement, deterministic execution, and seamless asset routing across the arc ecosystem.

---

## production & deployment status

- **live app:** [arcsetu.vercel.app](https://arcsetu.vercel.app)
- **repository:** [github.com/oamohm/Arcsetu](https://github.com/oamohm/Arcsetu)
- **target network:** arc testnet (chain id: `5042002`)
- **settlement token:** native usdc (`0x1c7D48196b0C7B01d743FbC6116a902379C7238`)
- **block explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)
- **ci/cd:** vercel automated deployments via github triggers

---

## system architecture


+-------------------------------------------------------------------+
|                        USER INTERFACE LAYER                       |
|       Next.js Dashboard | Tailwind CSS | i18n Engine              |
|                 Hosted on Vercel Edge Network                     |
+-------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------+
|                       WEB3 ABSTRACTION LAYER                      |
|         Wagmi Hooks | Viem Engine | RainbowKit Connector          |
|              HTML5 POS Scanner & Invoice Generator                |
+-------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------+
|                      SMART CONTRACT LOGIC LAYER                   |
|   Arc Native Settlement Engine | Arc UP Handle Resolver Registry  |
|      Programmable Fee Splitter | Treasury Yield Vault             |
+-------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------+
|                         ON-CHAIN STATE LAYER                      |
|         Arc Testnet Consensus | Circle CCTP Routing Bridge        |
|             Sub-Second Finality | ArcScan Verification            |
+-------------------------------------------------------------------+

---

## core modules

### 1. arc multi-chain identity
- **handle registry:** maps custom handles (e.g., `@handle`) deterministically to `0x` wallet addresses.
- **treasury tracking:** displays real-time arc treasury balances and issues verified builder stamps.

### 2. asset routing & settlement engine
- **native usdc routing:** direct transfers via native gas usdc or erc-20 contract mechanisms.
- **circle cctp bridge:** integrated cross-chain liquidity routing.
- **execution benchmarks:** real-time speed monitoring for sub-second deterministic settlement.

### 3. programmable fee engine
- **auto-split payments:** automated revenue distribution (e.g., creator fees, protocol split, treasury yield).
- **cross-chain royalties:** programmatic distribution directly on arc network.

### 4. merchant pos & yield vault
- **pos qr invoices:** dynamic qr generation with integrated camera scanner for instant point-of-sale payments.
- **audit logs:** exportable csv verification logs tied directly to arcscan transaction hashes.

---

## tech stack

- **frontend framework:** next.js, react, tailwind css
- **web3 stack:** viem, wagmi, rainbowkit
- **cross-chain infrastructure:** circle cctp
- **hosting:** vercel edge network

---

## getting started locally

```bash
# clone repository
git clone [https://github.com/oamohm/Arcsetu.git](https://github.com/oamohm/Arcsetu.git)

# navigate to directory
cd Arcsetu

# install dependencies
npm install

# run development server
npm run dev

open http://localhost:3000 to view the app locally.

