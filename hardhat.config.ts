// load env file
import dotenv from 'dotenv'
dotenv.config()

import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_RPC || '',
        blockNumber: 15647465,
      },
    },
  },
}

export default config
