# Uniswap v3 on zkSync

🚧 work in progress 🚧

This repo contains the script to submit the governance proposal to deploy Uniswap v3 on zkSync.

The script has been created following the [governance documentation](https://docs.uniswap.org/protocol/guides/governance/liscense-modifications/) and includes a license modification to allow Matter Labs to deploy Uniswap.

## Proposal information

Proposal information can be found at the end of the `utils.ts` file.

## Prerequisites

This project requires Node.js and NPM. [Installation guide](https://nodejs.org/en/download/)

Install all dependencies with `npm i`

## Testing

The `test/simulate-proposal-process.ts` file simulates the whole lifecycle of the proposal, from sending it, voting, queue and execution.

Before running the test, rename `.env.example` to `.env` and enter following params:

- `SIGNER` wallet address that will send the proposal. Must have 2.5Mill UNI.

> **Important**: this test runs against an Ethereum mainnet fork from block 15647465. You can change this block in the `hardhat.confg.ts` file.

Once configured, run `npx hardhat test`, to run the whole lifecycle script. You'll see the progress in the terminal and, if everything goes write you'll see something like this:

```
....
Proposal executed? :>>  true
✅ All good.
License in ENS now contains text:
```

## Run script

**To actually send a proposal, you need a wallet with 2.5 million UNI tokens**

Before running the script to send the proposal, rename `.env.example` to `.env` and enter following params:

- `WALLET_PRIVATE_KEY` wallet **private key** that will sign the transaction to send the proposal. Must have 2.5Mill UNI.
- `MAINNET_RPC`: and RPC enpoint of the Ethereum mainnet. You can get one from Chainstack/Alchemy/Infura

To execute the proposal script, run `npm start`. This will execute the script using **ts-node** via `npx` so it'll require you to be online.

You'll see the progress in the console with a transaction id that you can search in [Etherscan](https://etherscan.io/)

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
