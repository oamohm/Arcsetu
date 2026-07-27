import { createConfig, http } from 'wagmi'
import { Chain } from 'wagmi/chains'

// 1. Primary Network: GIWA Sepolia (Default)
export const giwaSepolia: Chain = {
  id: 9111, // GIWA Sepolia Chain ID
  name: 'GIWA Sepolia',
  network: 'giwa-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia-rpc.giwa.io'] },
    public: { http: ['https://sepolia-rpc.giwa.io'] },
  },
  blockExplorers: {
    default: { name: 'GiwaExplorer', url: 'https://sepolia-explorer.giwa.io' },
  },
  testnet: true,
}

// 2. Secondary Network: Arc Network (USDC Settlement)
export const arcNetwork: Chain = {
  id: 12345, // Arc Network Chain ID
  name: 'Arc Network',
  network: 'arc-network',
  nativeCurrency: {
    decimals: 18,
    name: 'Arc',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.arc.network'] },
    public: { http: ['https://rpc.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer.arc.network' },
  },
  testnet: true,
}

// Token Contracts Registry
export const TOKENS = {
  GIWA_SEPOLIA: {
    ETH: '0x0000000000000000000000000000000000000000',
  },
  ARC_NETWORK: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Arc USDC Address
  },
} as const

export const config = createConfig({
  chains: [giwaSepolia, arcNetwork],
  transports: {
    [giwaSepolia.id]: http(),
    [arcNetwork.id]: http(),
  },
})
