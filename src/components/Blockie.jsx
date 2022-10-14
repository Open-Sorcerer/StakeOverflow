import BlockiesModule from "react-blockies";
import { useDapp } from "providers/DappProvider";

// react-blockies is CommonJS; under Vite its default import arrives wrapped.
export const Blockies = BlockiesModule.default ?? BlockiesModule;

/**
 * Shows a blockie image for the provided wallet address
 * @param {*} props
 * @returns <Blockies> JSX Elemenet
 */

function Blockie({ address, currentWallet, size = 8, scale = 3 }) {
  const { walletAddress } = useDapp();
  const seed = (currentWallet ? walletAddress : address)?.toLowerCase();
  if (!seed) return null;

  return <Blockies seed={seed} size={size} scale={scale} className="identicon" />;
}

export default Blockie;
