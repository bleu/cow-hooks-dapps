import { IMinimalPool } from '../types'

export function useUserPools(user?: string): IMinimalPool[] {
  // TODO: replace with real data

  if (!user) return []
  return [
    {
      id: '0x94a5afbf8f987d6eadb1c0fe73366321c5fe950b',
      chain: 'ARBITRUM',
      symbol: 'ARB-WETH',

      dynamicData: {
        totalLiquidity: '552.68',
        volume24h: '0.58',
      },
      allTokens: [
        {
          address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
          symbol: 'WETH',
          decimals: 18,
        },
        {
          address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
          symbol: 'ARB',
          decimals: 18,
        },
      ],
      userBalance: {
        totalBalance: '100',
      },
    },
    {
      id: 'test',
      chain: 'test',
      symbol: 'AAA-BBB',

      dynamicData: {
        totalLiquidity: '10000.68',
        volume24h: '0.58',
      },
      allTokens: [
        {
          address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
          symbol: 'BBB',
          decimals: 18,
        },
        {
          address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
          symbol: 'AAA',
          decimals: 18,
        },
      ],
      userBalance: {
        totalBalance: '2000',
      },
    },
  ]
}
