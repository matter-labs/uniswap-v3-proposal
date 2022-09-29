# Uniswap v3 on zkSync

🚧 work in progress 🚧

This repo contains the script to submit the governance proposal to deploy Uniswap v3 on zkSync.

The script has been created following the [governance documentation](https://docs.uniswap.org/protocol/guides/governance/liscense-modifications/) and includes a license modification to allow Matter Labs to deploy Uniswap.

## Prerequisites

This project requires Node.js and NPM. [Installation guide](https://nodejs.org/en/download/)

## Configuration

You'd need to configure an RPC endpoint and the wallet address that will submit the proposal. Rename `.env.example` to `.env` and enter the details in the file.

## Run script

To execute the proposal script, run `npm start`. This will execute the script using **ts-node** via `npx` so it'll require you to be online.

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
