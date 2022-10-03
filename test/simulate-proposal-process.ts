// load env file
import dotenv from 'dotenv'
dotenv.config()

import { Contract } from 'ethers'

import { ethers } from 'hardhat'
import { namehash } from '@ethersproject/hash'
import { Interface } from '@ethersproject/abi'

// note: contract ABIs should be imported via etherscan
import {
  GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
} from '../utils'

const GOVERNOR_BRAVO_ADDRESS: string =
  '0x408ED6354d4973f66138C91495F2f2FCbd8724C3'

const PUBLIC_ENS_RESOLVER_ADDRESS: string =
  '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'

const provider = new ethers.providers.JsonRpcProvider(
  process.env.PROVIDER_RPC_URL
)
// Create a new local instance of the governorBravo contract
// Note that in production the abi should be gathered via etherscan
const governorBravo = new Contract(
  GOVERNOR_BRAVO_ADDRESS,
  GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
  provider
)

// @ts-ignore
let impersonatedSigner: any
let impersonatedVoter: any

// creates proposal similar to the real one in index.ts
async function createProposal() {
  const ensPublicResolverInterface = new Interface(ENS_PUBLIC_RESOLVER_ABI)
  const setTextCalldata = ensPublicResolverInterface.encodeFunctionData(
    'setText',
    [
      // node: The node to update
      namehash('v3-core-license-grants.uniswap.eth'),
      // key: The key to set: '[your-projects-additional-use-grant-title]',
      'Matter Labs Uni v3 Additional Use Grant',
      // value: The text data value to set: '[your-additional-use-grant-description]',
      `Matter Labs is granted an additional use grant to use the Uniswap V3 Core software code (which is made available to Matter Labs subject to license available at https://github.com/Uniswap/v3-core/blob/main/LICENSE (the “Uniswap Code”)). As part of this additional use grant, Matter Labs receives license to use the Uniswap Code for the purposes of a full deployment of the Uniswap Protocol v3 onto the zkSync blockchain. Matter Labs is permitted to use subcontractors to do this work. This license is conditional on Matter Labs complying with the terms of the Business Source License 1.1, made available at https://github.com/Uniswap/v3-core/blob/main/LICENSE.)`,
    ]
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
  const description = `# Deploy Uniswap V3 on zkSync ## FranklinDAO (Prev. Penn Blockchain) is creating this proposal in partnership with Matter Labs to Deploy Uniswap V3 on zkSync.
`
  return { targets, values, signatures, calldatas, description }
}

async function getImpersonatedSigner() {
  // @ts-ignore
  impersonatedSigner = await ethers.getImpersonatedSigner(process.env.SIGNER)
  // @ts-ignore
  impersonatedVoter = await ethers.getImpersonatedSigner(process.env.VOTER)
}

/**
 * Mines blocks
 * @param n number of blocks to mine
 */
async function mineBlocks(n: Number = 13140) {
  for (let index = 0; index < n; index++) {
    await provider.send('evm_mine', [])
  }
}
async function test() {
  try {
    /**
     *  checks current block
     * checks number of proposals
     * submit proposal
     * move blocks
     * check proposal status
     * move to start block: current + 13140 = 15660606
     * cast votes in favor
     * move to end voting block: current + 40320
     * check proposal status
     * run .queue(id) to move to Timelock period
     * run .execute(id) to run
     *
     * At any time, it can be cancelled with .cancel(id)
     * */

    // get signers
    await getImpersonatedSigner()
    //generate proposal trx
    const proposalData = await createProposal()

    const block = await provider.getBlockNumber()
    console.log('Initial block :>> ', block)
    const n_proposals = await governorBravo.proposalCount()
    console.log('Total number of proposals :>> ', n_proposals)

    let propsByAcc = await governorBravo.latestProposalIds(process.env.SIGNER)
    console.log('Proposals by signer :>> ', propsByAcc)

    // send proposal
    const txResponse = await governorBravo
      .connect(impersonatedSigner)
      .propose(
        proposalData.targets,
        proposalData.values,
        proposalData.signatures,
        proposalData.calldatas,
        proposalData.description
      )
    console.log(`Proposal transaction sent: ${txResponse.hash}`)

    const res = await txResponse.wait(1)
    console.log(
      `Proposal has been mined at blocknumber: ${txResponse.blockNumber}, transaction hash: ${txResponse.hash}`
    )

    console.log('events :>> ', res.events[0].args)

    // mine  block
    await mineBlocks(1)

    const block3 = await provider.getBlockNumber()
    console.log('Current block :>> ', block3)

    propsByAcc = await governorBravo.latestProposalIds(process.env.SIGNER)
    console.log('Proposals By Signer :>> ', propsByAcc)

    // get proposal status. Proposal id is 25
    try {
      let proposalStatus = await governorBravo.state(25)
      console.log('Proposal Status :>>', proposalStatus)
    } catch (error) {
      console.error('Error getting state: ', error)
    }

    // mines blocks until start block
    await mineBlocks()

    // vote in favour, id = 25, vote in favour = 1
    try {
      const voteRes = await governorBravo
        .connect(impersonatedVoter)
        .castVote(25, 1)
      console.log('Cast Vote response :>> ', voteRes)
    } catch (error) {
      console.error('ERROR Voting: ', error)
    }

    // mine blocks until endBlock
    await mineBlocks(40320)
    const proposalStatusAfter = await governorBravo.state(25)
    console.log('Proposal status after enbBlock :>> ', proposalStatusAfter)

    // move into timelock period, proposal can only be queued if it is succeeded
    const queue = await governorBravo.connect(impersonatedSigner).queue(25)
    console.log('Response queue trx :>> ', queue)

    // mine blocks past Timelock period
    await mineBlocks(15000)

    // execute proposal
    const exec = await governorBravo.connect(impersonatedSigner).execute(25)
    console.log('Proposal executed :>> ', exec)

    console.log('End 🏁')
  } catch (error) {
    console.error(error)
  }
}

test().then(() => console.log('done'))
