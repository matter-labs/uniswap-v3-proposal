// load env file
import dotenv from 'dotenv'
dotenv.config()

import { Contract, ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
// import { keccak256 } from '@ethersproject/keccak256'
import { Interface } from '@ethersproject/abi'
// note: contract ABIs should be imported via etherscan
import {
  GOVERNOR_BRAVO_ABI,
  // ENS_REGISTRY_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
} from './utils'

const GOVERNOR_BRAVO_ADDRESS: string =
  '0x408ED6354d4973f66138C91495F2f2FCbd8724C3'
// const ENS_REGISTRY_ADDRESS: string =
//   '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
const PUBLIC_ENS_RESOLVER_ADDRESS: string =
  '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'
// const UNISWAP_GOVERNANCE_TIMELOCK_ADDRESS: string =
//   '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'

const provider = new ethers.providers.JsonRpcProvider(
  process.env.PROVIDER_RPC_URL
)
const signer = provider.getSigner(process.env.SIGNER)

// note: setting the subnode record should only take place if the subdomain does not already exist
// const ensRegistryInterface = new Interface(ENS_REGISTRY_ABI)
// const setSubnodeRecordCalldata = ensRegistryInterface.encodeFunctionData(
//   'setSubnodeRecord',
//   [
//     // node: The parent node
//     namehash('uniswap.eth'),
//     // label: The hash of the label specifying the subnode
//     // keccak256('v3-core-license-grants'),
//     // hash value taken from https://github.com/Uniswap/deploy-v3#licensing
//     '0x15ff9b5bd7642701a10e5ea8fb29c957ffda4854cd028e9f6218506e6b509af2',

//     // owner: The address of the new owner
//     UNISWAP_GOVERNANCE_TIMELOCK_ADDRESS,
//     // resolver: The address of the resolver
//     PUBLIC_ENS_RESOLVER_ADDRESS,
//     // ttl: The TTL, i.e., time to live, in seconds
//     0,
//   ]
// )

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

// Create a new local instance of the governorBravo contract
// Note that in production the abi should be gathered via etherscan
const governorBravo = new Contract(
  GOVERNOR_BRAVO_ADDRESS,
  GOVERNOR_BRAVO_ABI,
  provider
)

// the ordered list of target addresses for calls to be made
const targets = [
  // ENS_REGISTRY_ADDRESS,
  PUBLIC_ENS_RESOLVER_ADDRESS,
]

// The ordered list of values to be passed to the calls to be made. i.e., the amount of
// ETH values to be transferred within the transaction. as this example does not include
// the transferring of any ETH, this list is empty.
const values = [
  // 0,
  0,
]

// The ordered list of function signatures to be called. The signatures arguments
// are optional, if not provided, the function signature will be inferred from the calldata
const signatures = [
  // '',
  '',
]

// The ordered list of calldata to be passed to each call in the proposal. The calldata
// in this example takes the place of the function signature arguments.
const calldatas = [
  // setSubnodeRecordCalldata,
  setTextCalldata,
]

// the description of the proposal.
const description = `# Deploy Uniswap V3 on zkSync ## FranklinDAO (Prev. Penn Blockchain) is creating this proposal in partnership with Matter Labs to Deploy Uniswap V3 on zkSync.

Matter Labs: @zkSync

**Proposal History**

The [consensus check](https://snapshot.org/#/uniswap/proposal/0xe6ad2033b04559b3db6be7fa9993f05ee68f43f1061c632382c88e367e76bfb1) passed with 24M (~100%) YES votes. The [temperature check](https://snapshot.org/#/uniswap/proposal/0xab1dbb6e3486073b81cc64b81d15d24a7bf82efcfc94e533de0779250df06ba9) passed with 15M (~100%) YES votes.

**Summary**

To support Uniswap's multichain mission and expand cross-chain experiences, we propose the deployment of Uniswap V3 to zkSync 2.0 on behalf of the community.

-   zkSync ecosystem has over [100 projects](https://ecosystem.zksync.io/) committed to launching on mainnet, including top DeFi protocols, infrastructure, on/off ramps, etc.

-   Deploying on zkSync will onboard new users & increase user activity on Uniswap by decreasing costs compared to Ethereum without security degradation

-   zkSync shares Ethereum's ethos as a free open-source project with a commitment to personal sovereignty, decentralization and community ownership

We welcome feedback from the community on the proposal, including suggestions on how it can be improved.

**About zkSync**

zkSync 2.0 is a [ZK rollup](https://ethereum.org/en/developers/docs/scaling/zk-rollups/) that supports generalized EVM compatibility for the Ethereum blockchain. The primary benefit of zkSync 2.0 is that developers who have created EVM dApps can port to zkSync 2.0 effortlessly and realize significantly lower gas fees and more transactions per second without compromising on security.

zkSync 2.0 is a significant leap forward in Layer 2 technologies with long awaited improvements and benefits for Ethereum developers:

-   EVM Compatible - supporting generalized EVM smart contracts on a ZK rollup making it easy to deploy existing dApps 

-   ToolChain Compatible - able to port smart contracts with existing tools

-   Ethos Compatible - aligned with the ethos of decentralization and open-source

-   Certainty - using zero knowledge proofs offering certainty of security not probability 

-   Future Proof - ecosystem partners that adopt zkSync 2.0 now will enjoy all future improvements without the need to change their code

There is broad consensus that ZK rollups are the endgame for scaling Ethereum. zkSync's EVM compatibility, ease of use, and composability will accelerate developer and retail adoption. Top researchers including [Vitalik Buterin](https://youtu.be/XW0QZmtbjvs) recognize ZK rollups as the long term scaling solution.

**Security & Bridges**

ZK rollups are the most secure scalability solution available today as they rely purely on math to fully inherit the security of Ethereum. There is a general L1<>L2 communication bridge which will support arbitrary message passing and secured by validity proof and Ethereum consensus.

Bridge validators can't pass an incorrect message or change the content, the worst case would be to censor everyone. Importantly, we'll be building out additional safety functionality and monitoring off & on-chain activity.

[Security is top of mind](https://docs.zksync.io/dev/security/approach/#_1-security-by-correctness) for zkSync. We are currently working with tier-1 auditors for zkSync 2.0 and specifically in the review process for the bridge code. Audits will be conducted before each major upgrade. Besides audits, we offer a substantial [bug bounty program](https://docs.zksync.io/dev/security/bug-bounty/).

**Proposal**

There's significant value in Uniswap being available on an EVM compatible ZK rollup. Deploying early on zkSync helps solidify Uniswap's place as the number one DEX and a thought leader.

Importantly, it will help grow a large list of projects that can be built on Uniswap V3. Established projects like Argent, Curve, and Yearn have committed to launch along with [over 100 more projects](https://ecosystem.zksync.io/) and big infrastructure players like Chainlink, The Graph, Gnosis are supporting the ecosystem. Growing the public smart contract libraries interfacing and using Uniswap v3 codebase will solidify Uniswap's influence in the Ethereum ecosystem which is moving on to ZK rollups.

While the zkSync ecosystem is already experiencing very fast growth, the team is planning  programs to attract and fund innovative projects and research partners to accelerate the network's adoption and in turn, Uniswap's usage.

**License Exemption**

We are requesting an exemption via an Additional Use Grant (license change enacted via the ENS domain uniswap.eth) that would allow Matter Labs to use the Licensed Work to deploy it on zkSync provided that the deployment is subject to Ethereum layer 1 Uniswap Protocol governance and control. Uniswap V3 will be deployed on zkSync by Matter Labs through the "[Deploy Uniswap V3 Script](https://github.com/Uniswap/deploy-v3#deploy-uniswap-v3-script)" albeit we may need to modify the compilation step with approval from the Uniswap Labs team.

**Timeline**

Following the Governance Proposal we will be ready to move forward with the Uniswap V3 deployment on zkSync.\
zkSync has been on testnet since February 2022 and plans to launch mainnet [early October](https://blog.matter-labs.io/100-days-to-mainnet-6f230893bd73). A timely assessment of the deployment of Uniswap v3 code to zkSync is important: while deploying on zkSync is fast and easy because it's fully EVM compatible, we estimate the full effort will take 4-6 weeks given Uniswap's relevance. This allows for proper testing, communication to the community and engagement with the broader zkSync ecosystem.`

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
