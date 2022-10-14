# StakeOverflow

An on-chain Q&A forum. Questions and answers are pinned to IPFS, while votes, reputation and tips settle on Polygon. Your reputation is your stake: it can't be transferred, it only changes when people vote on your posts, and it is tracked per topic.

For the original pitch, read the pitch deck (`Stack Overflow On-Chain.pdf`).

## How it works

- **Ask:** a post's content is pinned to IPFS and its URI is written to the contract with `createPost`.
- **Vote:** `voteUp` / `voteDown` move the author's reputation in that topic. Each vote carries ⌊log₂⌋ of the voter's own reputation in the topic, the maximum the contract allows (1 point below 4 reputation). Downvotes stop at 0.
- **Tip:** native POL goes straight from your wallet to the author's.

## Stack

React 18 on Vite, with [wagmi](https://wagmi.sh) + [viem](https://viem.sh) for the chain and [RainbowKit](https://rainbowkit.com) for the wallet modals. Installed browser wallets (MetaMask, Rabby, Phantom, Coinbase and others) are discovered automatically through [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963). The app targets Polygon Amoy.

## Running the app

Prerequisites: Git, Node.js 20.19+ or 22.12+, npm, and a browser wallet. Testnet POL for tipping is available from the [Polygon faucet](https://faucet.polygon.technology/).

```bash
git clone https://github.com/Open-Sorcerer/DeStackOverflow
cd DeStackOverflow
npm install
npm start
```

The app runs at `http://localhost:3000`.

**Phone wallets (optional).** To let people connect phone wallets by QR code through WalletConnect, get a free project ID at [dashboard.reown.com](https://dashboard.reown.com) and set it in `.env`:

```bash
VITE_WALLETCONNECT_PROJECT_ID = your-project-id
```

Without it, the connect modal offers installed browser wallets only.

## Current status

- **Wallets and tips are real:** connecting, switching networks, and tipping in testnet POL all go through your wallet.
- **Questions, votes and reputation are not on-chain yet:** they run on an in-memory store seeded with sample threads (`src/data/store.jsx`) until the contract is redeployed. The store follows the contract's vote weighting, its one-vote-per-post rule and its zero floor on downvotes. Everything goes through the hooks in `src/data`, so a contract-backed version can replace the store without UI changes.
- **The contract needs redeploying:** `smart contracts/contracts/StakeOverflow.sol` was deployed to Polygon Mumbai, which has been retired. It needs redeploying to Amoy.
- **No Sybil resistance:** any fresh wallet can cast a 1-point vote.

## Future plans

- Redeploy the contract to Polygon Amoy and back the `src/data` hooks with it
- Record tips on-chain with a `donate` function
- Add a search function
