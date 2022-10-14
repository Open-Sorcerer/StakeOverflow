import { polygonAmoy } from "viem/chains";

/** The network StakeOverflow runs on. */
export const SUPPORTED_CHAIN = {
  chain: polygonAmoy,
  id: polygonAmoy.id,
  name: "Polygon Amoy",
  shortName: "Amoy",
  currency: polygonAmoy.nativeCurrency.symbol,
  explorer: polygonAmoy.blockExplorers.default.url,
};

/**
 * Free project ID from https://dashboard.reown.com. Without it the connect
 * modal offers browser-extension wallets only; with it, mobile wallets can
 * connect over WalletConnect (QR code) too.
 */
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

/** Parent id the contract uses for top-level questions ("0x91", right-padded to bytes32). */
export const ROOT_PARENT_ID =
  "0x9100000000000000000000000000000000000000000000000000000000000000";
