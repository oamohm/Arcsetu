# giwasetu — gasok builder onboarding hub

giwasetu is a streamlined web3 onboarding and p2p token transfer interface built for the giwa gasok builder program. it focuses on deterministic execution and optimal payment ux on the giwa sepolia testnet.

## live infrastructure
* live environment: [giwasetu-contract.vercel.app](https://giwasetu-contract-bhupendrxsingh.vercel.app)
* block explorer: [sepolia-explorer.giwa.io](https://sepolia-explorer.giwa.io)
* contract address: `0xbABcB2540639b071b4fDF570a8E7c54b5899384c`

## core systems
1. native testnet faucets: integrated routing to lambda256 primary and backup faucets.
2. up.id identity state: on-chain user identity registration linked with local state persistence.
3. execution workflow: step-by-step state tracking for wallet creation, practice transactions, and dojang stamp issuance.
4. p2p payment ux: lightweight native token transfer module with real-time explorer validation.

## technical stack
* smart contract: solidity
* frontend execution: next.js, typescript, wagmi v2, viem
* deployment: vercel ci/cd pipeline

## local environment
```bash
git clone [https://github.com/oamohm/giwasetu-contract.git](https://github.com/oamohm/giwasetu-contract.git)
cd giwasetu-contract
npm install
npm run dev
