import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const giwaSepolia = {
  id: 9111,
  name: 'GIWA Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rpc.giwa.io'] },
  },
  blockExplorers: {
    default: { name: 'GiwaExplorer', url: 'https://sepolia-explorer.giwa.io' },
  },
  testnet: true,
} as const

export const arcNetwork = {
  id: 12345,
  name: 'Arc Network',
  nativeCurrency: { name: 'Arc USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer.arc.network' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [giwaSepolia, arcNetwork],
  transports: {
    [giwaSepolia.id]: http(),
    [arcNetwork.id]: http(),
  },
})
