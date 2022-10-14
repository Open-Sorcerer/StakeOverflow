import { Blockies } from "components/Blockie";
import { darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { SUPPORTED_CHAIN, WALLETCONNECT_PROJECT_ID } from "config";

const appName = "StakeOverflow";
const chains = [SUPPORTED_CHAIN.chain];

/**
 * With a WalletConnect project ID we use RainbowKit's full wallet list.
 * Without one, only browser-extension wallets are offered: wagmi discovers
 * every installed one through EIP-6963, and RainbowKit lists them as "Installed".
 */
export const wagmiConfig = WALLETCONNECT_PROJECT_ID
  ? getDefaultConfig({ appName, projectId: WALLETCONNECT_PROJECT_ID, chains })
  : createConfig({ chains, transports: { [SUPPORTED_CHAIN.id]: http() } });

const base = darkTheme({
  accentColor: "#f4f1ea",
  accentColorForeground: "#0a0a0a",
  borderRadius: "large",
  overlayBlur: "small",
});

/** RainbowKit's dark theme, re-tuned to the app's design tokens (see style.css). */
export const walletTheme = {
  ...base,
  colors: {
    ...base.colors,
    modalBackground: "#111114",
    modalBorder: "rgba(255, 255, 255, 0.08)",
    modalText: "#f4f1ea",
    modalTextSecondary: "rgba(244, 241, 234, 0.55)",
    modalTextDim: "rgba(244, 241, 234, 0.3)",
    modalBackdrop: "rgba(0, 0, 0, 0.55)",
    generalBorder: "rgba(255, 255, 255, 0.08)",
    generalBorderDim: "rgba(255, 255, 255, 0.05)",
    menuItemBackground: "rgba(255, 255, 255, 0.05)",
    actionButtonSecondaryBackground: "rgba(255, 255, 255, 0.06)",
    actionButtonBorder: "rgba(255, 255, 255, 0.06)",
    closeButtonBackground: "rgba(255, 255, 255, 0.06)",
    closeButton: "rgba(244, 241, 234, 0.6)",
    profileForeground: "#0b0b0d",
    profileAction: "rgba(255, 255, 255, 0.05)",
    profileActionHover: "rgba(255, 255, 255, 0.09)",
    selectedOptionBorder: "rgba(244, 128, 36, 0.6)",
    connectionIndicator: "#5eead4",
    standby: "#ffb36b",
    error: "#fb7185",
  },
  fonts: { body: '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif' },
  radii: {
    ...base.radii,
    modal: "28px",
    modalMobile: "28px",
    actionButton: "999px",
    connectButton: "999px",
    menuButton: "14px",
  },
  shadows: {
    ...base.shadows,
    dialog: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 60px 120px -40px rgba(0,0,0,0.9)",
    selectedOption: "0 0 0 1px rgba(244, 128, 36, 0.5)",
    selectedWallet: "0 0 0 1px rgba(244, 128, 36, 0.5)",
  },
};

/** Use the same blockie avatars as the rest of the app inside RainbowKit's modals. */
export const BlockieAvatar = ({ address, size }) => (
  <Blockies seed={address.toLowerCase()} size={8} scale={size / 8} className="identicon" />
);
