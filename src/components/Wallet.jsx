import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSession } from "providers/DappProvider";
import { SUPPORTED_CHAIN } from "config";
import { PolygonLogo } from "./Chains/Logos";
import Blockie from "./Blockie";
import PillButton from "./ui/PillButton";

/**
 * Network and account pills for the nav. RainbowKit supplies the state and the
 * connect / network / account modals; the pills themselves are ours.
 */
function Wallet() {
  const { connect } = useSession();

  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal }) => {
        // Render nothing until RainbowKit knows the connection state, so pills don't flicker.
        if (!mounted) return <span aria-hidden="true" style={{ visibility: "hidden" }} />;

        if (!account || !chain) {
          return (
            <PillButton size="sm" icon="wallet" onClick={connect}>
              Connect<span className="account-label"> wallet</span>
            </PillButton>
          );
        }

        return (
          <>
            {chain.unsupported ? (
              <button type="button" className="pill pill-warn" onClick={openChainModal}>
                <span className="chain-logo">
                  <PolygonLogo />
                </span>
                Switch to {SUPPORTED_CHAIN.shortName}
              </button>
            ) : (
              <button
                type="button"
                className="pill"
                onClick={openChainModal}
                title={`Connected to ${SUPPORTED_CHAIN.name}`}
              >
                <span className="chain-logo">
                  <PolygonLogo />
                </span>
                <span className="chain-label">{SUPPORTED_CHAIN.shortName}</span>
                <span className="status-dot" />
              </button>
            )}
            {/* RainbowKit disables the account modal on an unsupported network; its network modal has Disconnect. */}
            <button
              type="button"
              className="pill"
              onClick={chain.unsupported ? openChainModal : openAccountModal}
            >
              <Blockie address={account.address} scale={2.5} />
              <span className="mono account-label">{account.displayName}</span>
            </button>
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default Wallet;
