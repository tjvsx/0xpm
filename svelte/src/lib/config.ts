type Network = {
  chainId: number,
  title: String,
  rpcUrl: string,
  nativeCurrency: { name: string, symbol: string, decimals: number },
  multicall2Address?: string,
  blockExplorerUrl?: string
}

export const NETWORKS: Network[] = [
  {
    chainId: 1,
    title: 'Ethereum',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/52J3V2vSvpezdbzm6a7n4_VZXzCJv6r4', // Your RPC endpoint
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    multicall2Address: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    blockExplorerUrl: 'https://etherscan.com'
  },
  {
    chainId: 1337,
    title: 'Ganache',
    rpcUrl: 'http://localhost:8545',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  }
]