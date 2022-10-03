# Uniswap v3 on zkSync

🚧 work in progress 🚧

This repo contains the script to submit the governance proposal to deploy Uniswap v3 on zkSync.

The script has been created following the [governance documentation](https://docs.uniswap.org/protocol/guides/governance/liscense-modifications/) and includes a license modification to allow Matter Labs to deploy Uniswap.

## Prerequisites

This project requires Node.js and NPM. [Installation guide](https://nodejs.org/en/download/)

## Configuration

You'd need to configure an RPC endpoint and the wallet address that will submit the proposal. Rename `.env.example` to `.env` and enter the details in the file.

## Testing

To simulate the full lifecycle of the proposal, configure the following parameters in the `.env` file:

- `MAINNET_RPC` with and endpoint from Infura/Alchemy/Chainstack.
- `PROVIDER_RPC_URL` set as `http://127.0.0.1:8545`
- `SIGNER` wallet address that will send the proposal. Must have 2.5Mill UNI.
- `VOTER` wallet address of a voter. Must have UNI tokens

Once configured, run `npx hardhat node`, which will fork mainnet from the block number indicated in the `hardhat.config.ts` file, and start a local node running on `127.0.0.1:8545`.

In a separate terminal, run `npm run test` to run the `simulate-proposal-process.ts` test script. You'll see the progress in the terminal.

## Run script

To execute the proposal script, run `npm start`. This will execute the script using **ts-node** via `npx` so it'll require you to be online.

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
