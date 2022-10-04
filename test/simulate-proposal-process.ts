import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers, network, waffle } from 'hardhat'
import { namehash } from '@ethersproject/hash'
import { Interface } from '@ethersproject/abi'

import { Contract } from 'ethers'

// load env file
import dotenv from 'dotenv'
dotenv.config()

import {
  GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
  TIMELOCK_ABI,
  ENS_REGISTRY_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
  UNI_ABI,
  PROPOSAL_BODY,
  ENS_RECORD_KEY,
  ENS_RECORD_VALUE,
} from '../utils'

const PUBLIC_ENS_RESOLVER_ADDRESS: string =
  '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'

// get a mock provider
const { provider } = waffle

describe('Simulate Uniswap proposal lifecycle', function () {
  /**
   * Mines a given number of blocks
   * @param n number of blocks to mine
   */
  async function mineBlocks(n: Number = 13140) {
    console.log(`⛏ Mining ${n} blocks...`)
    for (let index = 0; index < n; index++) {
      await provider.send('evm_mine', [])
    }
    console.log('Finished mining blocks')
    const blockNumber = (await provider.getBlock('latest')).number
    console.log('Current blockNumber now is: ', blockNumber)
  }

  // declare global scope variables here

  it('should simulate whole lifecycle successfully', async () => {
    // ENS subdomain node
    const ENS_NODE = namehash('v3-core-license-grants.uniswap.eth')
    const TTL: number = 0

    // get the governor bravo contract
    const governorBravoAddress = '0x408ED6354d4973f66138C91495F2f2FCbd8724C3'
    const governorBravo = new Contract(
      governorBravoAddress,
      GOVERNOR_BRAVO_IMPLEMENTATION_ABI,
      provider
    )

    // get the timelock contract
    const timelockAddress = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'
    const timeLock = new Contract(timelockAddress, TIMELOCK_ABI, provider)

    // ens resolver contract
    const ensPublicResolver = new Contract(
      PUBLIC_ENS_RESOLVER_ADDRESS,
      ENS_PUBLIC_RESOLVER_ABI,
      provider
    )

    const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    const ensRegistry = new Contract(
      ENS_REGISTRY_ADDRESS,
      ENS_REGISTRY_ABI,
      provider
    )
    let subnodeResolver = await ensRegistry.resolver(ENS_NODE)

    // get signers
    // const [wallet, other] = await (ethers as any).getSigners()

    const [wallet, otherAccount] = await ethers.getSigners()

    // check the timelock from the governor matches the timelock address
    const timelockAddressFromGovernor = await governorBravo.timelock()

    expect(timelockAddressFromGovernor).to.eq(timeLock.address)

    // checks number of proposals
    let currentProposalCount = await governorBravo.proposalCount() // expect 10
    console.log('currentProposalCount', currentProposalCount)
    expect(currentProposalCount).to.eq(24)

    // impersonate user that will send proposal
    const proposeWallet = process.env.SIGNER || ''
    const impersonatedSigner = await ethers.getImpersonatedSigner(proposeWallet)

    let blockNumber = (await provider.getBlock('latest')).number
    console.log('Current blockNumber', blockNumber)

    // check ENS  subnode already exists
    subnodeResolver = await ensRegistry.resolver(ENS_NODE)
    console.log('subnodeResolver', subnodeResolver)

    expect(subnodeResolver.toLowerCase()).to.eq(
      PUBLIC_ENS_RESOLVER_ADDRESS.toLowerCase()
    )

    let ttlOfSubnode = await ensRegistry.ttl(ENS_NODE)

    expect(ttlOfSubnode).to.eq(TTL)

    const subnodeRecordExists = await ensRegistry.recordExists(ENS_NODE)
    expect(subnodeRecordExists).to.eq(true)

    console.log(
      'ENS Subdomain already exists, no need to execute setSubnodeRecord()'
    )

    // creates proposal with
    const ensPublicResolverInterface = new Interface(ENS_PUBLIC_RESOLVER_ABI)
    const setTextCalldata = ensPublicResolverInterface.encodeFunctionData(
      'setText',
      [
        // node: The node to update: namehash('v3-core-license-grants.uniswap.eth'),
        ENS_NODE,
        // key: The key to set: '[your-projects-additional-use-grant-title]',
        ENS_RECORD_KEY,
        // value: The text data value to set: '[your-additional-use-grant-description]',
        ENS_RECORD_VALUE,
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
    const description = PROPOSAL_BODY

    // send proposal
    const txResponse = await governorBravo
      .connect(impersonatedSigner)
      .propose(targets, values, signatures, calldatas, description)

    console.log(`Proposal transaction sent: ${txResponse.hash}`)

    const res = await txResponse.wait(1)
    console.log(
      `Proposal has been mined at blocknumber: ${txResponse.blockNumber}, transaction hash: ${txResponse.hash}`
    )

    // @ts-ignore
    const event = res.events.find((event) => event.event === 'ProposalCreated')

    // console.log('Proposal id is :>> ', event.args.id.toNumber())
    // console.log('Proposal description is :>> ', event.args.description)
    // console.log('Proposal startBlock is :>> ', event.args.startBlock)
    // console.log('Proposal endBlock is :>> ', event.args.endBlock)

    currentProposalCount = await governorBravo.proposalCount()
    expect(currentProposalCount).to.eq(25)

    let proposalInfo = await governorBravo.proposals(event.args.id.toNumber())
    console.log('Proposal id is :>> ', proposalInfo.id.toNumber())
    console.log('Proposal startBlock is :>> ', proposalInfo.startBlock)
    console.log('Proposal endBlock is :>> ', proposalInfo.endBlock)

    expect(proposalInfo.proposer).to.eq(impersonatedSigner.address)

    // get proposal status. Returns the index of the following enum
    /**
     * enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
        }
     */
    let proposalStatus = await governorBravo.state(proposalInfo.id.toNumber())

    // check if status is Pending right after creation
    expect(proposalStatus).to.eq(0)
    //advance to start block
    await mineBlocks(proposalInfo.startBlock.toNumber() - blockNumber)

    // check if status is Active after advancing into voting period
    proposalStatus = await governorBravo.state(proposalInfo.id.toNumber())
    expect(proposalStatus).to.eq(1)

    // cast votes
    const uniHolders = [
      '0x0ec9e8aa56e0425b60dee347c8efbad959579d0f',
      '0x5f246d7d19aa612d6718d27c1da1ee66859586b0',
      '0x177df24addc9a216f927d2a894ab0b6eec59eb09',
      '0x61c8d4e4be6477bb49791540ff297ef30eaa01c2',
      '0xe02457a1459b6c49469bf658d4fe345c636326bf',
      '0x2b1ad6184a6b0fac06bd225ed37c2abc04415ff4',
      '0x8e4ed221fa034245f14205f781e0b13c5bd6a42e',
      '0xa2bf1b0a7e079767b4701b5a1d9d5700eb42d1d1',
    ]

    for (let index = 0; index < uniHolders.length; index++) {
      // send ETH to UNI holder to pay for vote trx
      await wallet.sendTransaction({
        to: uniHolders[index],
        value: ethers.utils.parseEther('1'),
      })

      // impersonate UNI token holder
      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [uniHolders[index]],
      })

      const uniSigner = await ethers.getSigner(uniHolders[index])
      // cast vote
      await governorBravo
        .connect(uniSigner)
        .castVote(proposalInfo.id.toNumber(), 1)
    }

    console.log('--------------')
    console.log('Voting complete 🗳')
    console.log('--------------')

    // check proposal info after votes
    proposalInfo = await governorBravo.proposals(event.args.id.toNumber())
    console.log('Votes in favour :>> ', proposalInfo.forVotes)
    console.log('Votes against :>> ', proposalInfo.againstVotes)
    console.log('Votes abstained :>> ', proposalInfo.abstainVotes)

    // proposal must have more than 40 Million votes
    expect(proposalInfo.forVotes.gt(40000000)).to.eq(true)

    // advance to end block
    await mineBlocks(
      proposalInfo.endBlock.toNumber() - proposalInfo.startBlock.toNumber() + 1
    )

    // check if status is Succeeded after advancing to the end of voting period
    proposalStatus = await governorBravo.state(proposalInfo.id.toNumber())
    expect(proposalStatus).to.eq(4)

    console.log('------------- \n')
    console.log('PROPOSAL VOTING SUCCESSFUL')
    console.log('------------- \n')

    // move into timelock period, proposal can only be queued if it is succeeded
    const queue = await governorBravo
      .connect(impersonatedSigner)
      .queue(proposalInfo.id.toNumber())

    // wait for queue trx
    const resQueue = await queue.wait(1)
    // console.log('Response queue trx :>> ', resQueue)

    console.log('------------- \n')
    console.log('PROPOSAL ADDED TO QUEUE AFTER SUCCESSFUL VOTING PERIOD')
    console.log('------------- \n')

    // check if status is Queued after queue() trx
    proposalStatus = await governorBravo.state(proposalInfo.id.toNumber())
    expect(proposalStatus).to.eq(5)
    proposalInfo = await governorBravo.proposals(proposalInfo.id.toNumber())
    console.log('Proposal after queue has ETA :>> ', proposalInfo.eta)

    // advance 2 days
    await network.provider.request({
      method: 'evm_increaseTime',
      params: [172800],
    })

    // mine one block after changing the time in VM
    await mineBlocks(1)

    console.log('------------- \n')
    console.log('EXECUTING PROPOSAL 🏋️')
    console.log('------------- \n')

    // execute proposal
    const exec = await governorBravo
      .connect(impersonatedSigner)
      .execute(proposalInfo.id.toNumber())

    const resExecute = await exec.wait()
    // console.log('Response execute trx :>> ', resExecute)

    // check if proposal has moved to Executed state
    proposalStatus = await governorBravo.state(proposalInfo.id.toNumber())
    expect(proposalStatus).to.eq(7)
    proposalInfo = await governorBravo.proposals(proposalInfo.id.toNumber())
    expect(proposalInfo.executed).to.eq(true)
    console.log('Proposal executed? :>> ', proposalInfo.executed)

    // check ens records are correctly updated  after proposal execution
    let licenseText = await ensPublicResolver.text(ENS_NODE, ENS_RECORD_KEY)
    expect(licenseText).to.eq(ENS_RECORD_VALUE)

    console.log(
      '✅ All good. \n License in ENS now contains text: \n',
      licenseText
    )
  })
})
