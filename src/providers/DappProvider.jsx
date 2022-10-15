import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useAccount, useConnectors, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const DappContext = createContext();

const GUEST_KEY = "stakeoverflow.guest";

const readGuest = () => {
  try {
    return sessionStorage.getItem(GUEST_KEY);
  } catch {
    return null;
  }
};

const writeGuest = (address) => {
  try {
    if (address) sessionStorage.setItem(GUEST_KEY, address);
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {
    // Storage can be unavailable (private mode); the guest then lasts until reload.
  }
};

/** A random, never-funded address that identifies a guest for this tab. */
const randomAddress = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
};

/**
 * App-wide state: who is signed in (a connected wallet, or a guest identity
 * when no wallet is connected), the selected topic, and the sign-in chooser.
 */
export function DappProvider({ children }) {
  const { address, chainId } = useAccount();
  const [guestAddress, setGuestAddress] = useState(readGuest);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  // null shows the topic overview.
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // A question to scroll to and open once its topic renders (e.g. from a profile).
  const [focusPostId, setFocusPostId] = useState(null);

  // Connecting a wallet replaces the guest identity.
  useEffect(() => {
    if (address && guestAddress) {
      writeGuest(null);
      setGuestAddress(null);
    }
  }, [address, guestAddress]);

  const value = useMemo(() => {
    const isGuest = !address && Boolean(guestAddress);
    return {
      walletAddress: address ?? guestAddress ?? undefined,
      chainId: address ? chainId : undefined,
      isGuest,
      startGuest: () => {
        const guest = randomAddress();
        writeGuest(guest);
        setGuestAddress(guest);
      },
      endGuest: () => {
        writeGuest(null);
        setGuestAddress(null);
      },
      isSignInOpen,
      setIsSignInOpen,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      focusPostId,
      setFocusPostId,
    };
  }, [address, chainId, guestAddress, isSignInOpen, selectedCategory, searchQuery, focusPostId]);

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

/**
 * Session: a connected wallet or a guest counts as signed in. `connect` opens the
 * sign-in chooser; `connectWallet` goes straight to RainbowKit's wallet modal.
 */
export function useSession() {
  const { status } = useAccount();
  const connectors = useConnectors();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { isGuest, startGuest, endGuest, setIsSignInOpen } = useDapp();
  const [restoreTimedOut, setRestoreTimedOut] = useState(false);

  // A stalled extension can leave wagmi "reconnecting" forever; don't hold the page for it.
  useEffect(() => {
    if (status !== "reconnecting") return undefined;
    const timer = setTimeout(() => setRestoreTimedOut(true), RESTORE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  function connectWallet() {
    setIsSignInOpen(false);
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
          , or continue as a guest.
        </span>,
        8
      );
      return;
    }
    openConnectModal?.();
  }

  return {
    isAuthenticated: status === "connected" || isGuest,
    isGuest,
    // wagmi restores the last connection on load; don't redirect while that runs.
    isRestoring: status === "reconnecting" && !restoreTimedOut,
    isAuthenticating: status === "connecting",
    connect: () => setIsSignInOpen(true),
    connectWallet,
    continueAsGuest: () => {
      setIsSignInOpen(false);
      startGuest();
    },
    disconnect: () => {
      setIsSignInOpen(false);
      if (isGuest) endGuest();
      else disconnect();
    },
  };
}
