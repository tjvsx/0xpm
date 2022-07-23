type Network = {
  chainId: number,
  title: String,
  rpcUrl: string,
  nativeCurrency: { name: string, symbol: string, decimals: number },
  multicall2Address?: string,
  blockExplorerUrl?: string
}

export const NETWORKS: Network[] = [
  // {
  //   chainId: 1,
  //   title: 'Ethereum',
  //   rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/52J3V2vSvpezdbzm6a7n4_VZXzCJv6r4`, // Your RPC endpoint
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  //   multicall2Address: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  //   blockExplorerUrl: 'https://etherscan.com'
  // },
  // {
  //   chainId: 4,
  //   title: 'Rinkeby',
  //   rpcUrl: `https://eth-rinkeby.alchemyapi.io/v2/c9IPBw260ET7_Tsdp4_hSNpk8n4Gd3vP`,
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  // },
  {
    chainId: 5,
    title: 'Goerli',
    rpcUrl: `https://eth-goerli.g.alchemy.com/v2/Ezuf6QHN47rQi4nlsump5x9UzF3OfYon`,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  // {
  //   chainId: 1337,
  //   title: 'Ganache',
  //   rpcUrl: 'http://localhost:8545',
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  // }
]