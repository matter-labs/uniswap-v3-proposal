// load env file
import dotenv from 'dotenv'
dotenv.config()

import { Contract, ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import { Interface } from '@ethersproject/abi'
// note: contract ABIs should be imported via etherscan
import {
  GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
  PROPOSAL_BODY,
  ENS_RECORD_KEY,
  ENS_RECORD_VALUE,
} from './utils'

const GOVERNOR_BRAVO_ADDRESS: string =
  '0x408ED6354d4973f66138C91495F2f2FCbd8724C3'

const PUBLIC_ENS_RESOLVER_ADDRESS: string =
  '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'

// RPC loaded from env file
const provider = new ethers.providers.JsonRpcProvider(
  process.env.PROVIDER_RPC_URL
)
// signer loaded from env file
const signer = provider.getSigner(process.env.SIGNER)

const ensPublicResolverInterface = new Interface(ENS_PUBLIC_RESOLVER_ABI)
const setTextCalldata = ensPublicResolverInterface.encodeFunctionData(
  'setText',
  [
    // node: The node to update
    namehash('v3-core-license-grants.uniswap.eth'),
    // key: The key to set: '[your-projects-additional-use-grant-title]',
    ENS_RECORD_KEY,
    // value: The text data value to set: '[your-additional-use-grant-description]',
    ENS_RECORD_VALUE,
  ]
)

// Create a new local instance of the governorBravo contract
// Note that in production the abi should be gathered via etherscan
const governorBravo = new Contract(
  GOVERNOR_BRAVO_ADDRESS,
  GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
  provider
)

// the ordered list of target addresses for calls to be made
const targets = [PUBLIC_ENS_RESOLVER_ADDRESS]

// The ordered list of values to be passed to the calls to be made. i.e., the amount of
// ETH values to be transferred within the transaction. as this example does not include
// the transferring of any ETH, this list is empty.
const values = [0]

// The ordered list of function signatures to be called. The signatures arguments
// are optional, if not provided, the function signature will be inferred from the calldata
const signatures = ['']

// The ordered list of calldata to be passed to each call in the proposal. The calldata
// in this example takes the place of the function signature arguments.
const calldatas = [setTextCalldata]

// the description of the proposal.
const description = PROPOSAL_BODY

async function main() {
  try {
    const txResponse: ethers.providers.TransactionResponse = await governorBravo
      .connect(signer)
      .propose(targets, values, signatures, calldatas, description)
    console.log(`Proposal transaction sent: ${txResponse.hash}`)
    await txResponse.wait(1)
    console.log(
      `Proposal has been mined at blocknumber: ${txResponse.blockNumber}, transaction hash: ${txResponse.hash}`
    )
  } catch (error) {
    console.error(error)
  }
}

main().then(() => console.log('done'))
