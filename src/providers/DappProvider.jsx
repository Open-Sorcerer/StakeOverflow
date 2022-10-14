import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useAccount, useConnectors, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const DappContext = createContext();

/** App-wide state: the connected wallet (from wagmi) and the selected topic. */
export function DappProvider({ children }) {
  const { address, chainId } = useAccount();
  // null shows the topic overview.
  const [selectedCategory, setSelectedCategory] = useState(null);

  const value = useMemo(
    () => ({ walletAddress: address, chainId, selectedCategory, setSelectedCategory }),
    [address, chainId, selectedCategory]
  );

  return <DappContext.Provider value={value}>{children}</DappContext.Provider>;
}

export function useDapp() {
  const context = useContext(DappContext);
  if (context === undefined) {
    throw new Error("useDapp must be used within a DappProvider");
  }
  return context;
}

/** How long to wait for a wallet to restore its connection before giving up on it. */
const RESTORE_TIMEOUT_MS = 4000;

/** Wallet session: connected means signed in. Connecting opens RainbowKit's modal. */
export function useSession() {
  const { status } = useAccount();
  const connectors = useConnectors();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [restoreTimedOut, setRestoreTimedOut] = useState(false);

  // A stalled extension can leave wagmi "reconnecting" forever; don't hold the page for it.
  useEffect(() => {
    if (status !== "reconnecting") return undefined;
    const timer = setTimeout(() => setRestoreTimedOut(true), RESTORE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  function connect() {
    // With no extension (and no WalletConnect project ID) the modal would be empty.
    if (connectors.length === 0) {
      message.info(
        <span>
          No wallet found. Install{" "}
          <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
            MetaMask
          </a>{" "}
          or{" "}
          <a href="https://rabby.io/" target="_blank" rel="noreferrer">
            Rabby
          </a>
          , or open this page in your wallet app.
        </span>,
        8
      );
      return;
    }
    openConnectModal?.();
  }

  return {
    isAuthenticated: status === "connected",
    // wagmi restores the last connection on load; don't redirect while that runs.
    isRestoring: status === "reconnecting" && !restoreTimedOut,
    isAuthenticating: status === "connecting",
    connect,
    disconnect: () => disconnect(),
  };
}
