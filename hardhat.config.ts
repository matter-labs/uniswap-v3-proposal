import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      forking: {
        // url: 'https://nd-212-519-633.p2pify.com/42aa1f97cf97620e4dfba56dc88a1fcf',
        url: 'https://eth-mainnet.g.alchemy.com/v2/KpDxHiMSPDAda9LqFjyrZwKmO9dswM1b',
        blockNumber: 15647465,
      },
    },
  },
}

export default config
