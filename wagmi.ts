import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

/**
 * Arc Testnet
 * Chain ID: 5042002
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: 'https://testnet.arcscan.app',
      apiUrl: 'https://testnet.arcscan.app/api',
    },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: 'Arcsetu',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [arcTestnet],
  ssr: true,
})
