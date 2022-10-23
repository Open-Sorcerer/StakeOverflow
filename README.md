<div align="center">

<a href="https://cdn.jsdelivr.net/gh/Open-Sorcerer/DeStackOverflow@main/.github/media/demo.mp4" title="Play the 22-second demo">
  <img src=".github/media/demo.gif" alt="StakeOverflow demo: asking a question, upvoting an answer and tipping its author in POL" width="100%">
</a>

<h1>StakeOverflow</h1>

<p><b>Stack Overflow, on-chain.</b><br>
Questions live on IPFS, votes are weighted by the reputation you've earned in each topic,<br>
and tips go wallet to wallet with a 0% cut.</p>

<p>
  <a href="https://cdn.jsdelivr.net/gh/Open-Sorcerer/DeStackOverflow@main/.github/media/demo.mp4"><b>▶&nbsp;Watch the 22-second demo</b></a> (with sound)
  &nbsp;·&nbsp;
  <a href="Stack%20Overflow%20On-Chain.pdf">Pitch deck</a>
  &nbsp;·&nbsp;
  <a href="#run-it-locally">Run it locally</a>
</p>

<p>
  <img alt="Polygon Amoy" src="https://img.shields.io/badge/Polygon-Amoy-8247E5?logo=polygon&logoColor=white">
  <img alt="IPFS" src="https://img.shields.io/badge/IPFS-content-65C2CB?logo=ipfs&logoColor=white">
  <img alt="Solidity" src="https://img.shields.io/badge/Solidity-contract-363636?logo=solidity&logoColor=white">
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-f48024">
</p>

</div>

---

## Why

On Stack Overflow, your posts and your reputation live on a platform you don't control. StakeOverflow treats reputation as a stake you hold: it can't be transferred, it only changes when people vote on your posts, and it's tracked per topic. A Solidity expert's vote counts for more on Solidity questions, and nobody can buy their way in.

## How it works

| | |
|---|---|
| **Ask** | A post's content is pinned to IPFS and its URI is written to the contract with `createPost`. |
| **Vote** | `voteUp` / `voteDown` move the author's reputation in that topic. Each vote carries ⌊log₂⌋ of the voter's own reputation in the topic, the maximum the contract allows (1 point below 4 reputation). Downvotes stop at 0. |
| **Tip** | Native POL goes straight from your wallet to the author's. Nothing sits in between. |
| **Accept** | The asker marks the reply that solved it. The accepted answer leads its thread, the question shows as Solved, and the answer's author gains 5 reputation in the topic. |

## Features

- **Markdown posts:** GitHub-flavoured markdown with highlighted code blocks, Solidity included.
- **Topics:** sort by newest, top or unanswered.
- **Search:** covers every topic. Press `/` from anywhere.
- **Profiles:** every address has one, showing its reputation per topic, its questions and its answers.
- **Any wallet:** installed browser wallets (MetaMask, Rabby, Phantom, Coinbase and others) are found automatically through [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963). With a WalletConnect project ID, phone wallets can connect by QR code too.
- **Guest mode:** try everything except tips without a wallet.

## Tech stack

| Layer | Built with |
|---|---|
| App | React 18 on Vite |
| Chain | [wagmi](https://wagmi.sh) + [viem](https://viem.sh), targeting Polygon Amoy |
| Wallets | [RainbowKit](https://rainbowkit.com), EIP-6963 discovery, optional WalletConnect |
| Content | IPFS |
| Contract | Solidity (`smart contracts/contracts/StakeOverflow.sol`) |

## Run it locally

You need Git, Node.js 20.19+ or 22.12+, and npm. A browser wallet is optional. To send tips you'll need testnet POL, which you can get from the [Polygon faucet](https://faucet.polygon.technology/).

```bash
git clone https://github.com/Open-Sorcerer/DeStackOverflow
cd DeStackOverflow
npm install
npm start
```

The app runs at `http://localhost:3000`. "Connect wallet" offers two ways in: connect a real wallet, or continue as a guest. A guest gets a temporary identity for the browser tab and can ask, answer and vote, but needs a wallet to send tips.

<details>
<summary><b>Optional: connect phone wallets with WalletConnect</b></summary>

<br>

Get a free project ID at [dashboard.reown.com](https://dashboard.reown.com), copy `.env.example` to `.env` and set it:

```bash
VITE_WALLETCONNECT_PROJECT_ID = your-project-id
```

Without it, the connect modal offers installed browser wallets only.

</details>

## Project structure

```text
src/
├── components/       Landing, feed, composer, votes, tips, profiles and search
├── data/             Forum hooks, backed by an in-memory store and seed threads
├── helpers/          Content, reputation and formatting helpers
├── providers/        Wallet session and guest identity
├── config.js         Target chain and WalletConnect project ID
└── wallet.jsx        wagmi and RainbowKit setup
smart contracts/
├── contracts/        StakeOverflow.sol and its ABI
└── eventAbi/         ABI of the contract's events
```

## Current status

- **Wallets and tips are real:** connecting, switching networks, and tipping in testnet POL all go through your wallet.
- **Questions, votes and reputation are not on-chain yet:** they run on an in-memory store seeded with sample threads (`src/data/store.jsx`) until the contract is redeployed. The store follows the contract's vote weighting, its one-vote-per-post rule and its zero floor on downvotes. Everything goes through the hooks in `src/data`, so a contract-backed version can replace the store without UI changes.
- **The contract needs redeploying:** `StakeOverflow.sol` was deployed to Polygon Mumbai, which has been retired. It needs redeploying to Amoy.
- **No Sybil resistance:** any fresh wallet can cast a 1-point vote.

## Roadmap

- [ ] Redeploy the contract to Polygon Amoy and back the `src/data` hooks with it
- [ ] Record tips on-chain with a `donate` function
- [ ] Add accepted answers to the contract (today they live in the in-memory store)

## License

[MIT](LICENSE.md)
