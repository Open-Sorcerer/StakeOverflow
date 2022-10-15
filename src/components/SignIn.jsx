import { Modal } from "antd";
import { useDapp, useSession } from "providers/DappProvider";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "./Blockie";
import Icon from "./ui/Icon";

const Option = ({ icon, title, description, onClick }) => (
  <button type="button" className="signin-option" onClick={onClick}>
    <span className="signin-icon">
      <Icon name={icon} size={20} />
    </span>
    <span className="signin-text">
      <span className="signin-title">{title}</span>
      <span className="signin-description">{description}</span>
    </span>
    <span className="tile-arrow">
      <Icon name="arrowUpRight" size={16} />
    </span>
  </button>
);

/** Chooser behind every "Connect wallet" button: a real wallet, or a guest identity. */
function SignIn() {
  const { isSignInOpen, setIsSignInOpen, isGuest, walletAddress } = useDapp();
  const { connectWallet, continueAsGuest, disconnect } = useSession();

  return (
    <Modal
      open={isSignInOpen}
      footer={null}
      onCancel={() => setIsSignInOpen(false)}
      width={440}
      centered
    >
      <span className="eyebrow">{isGuest ? "Guest" : "Sign in"}</span>
      <h2 className="display signin-heading">
        {isGuest ? (
          <>
            Browsing as a <em>guest.</em>
          </>
        ) : (
          <>
            Join the <em>conversation.</em>
          </>
        )}
      </h2>

      {isGuest && (
        <div className="wallet-address">
          <Blockie address={walletAddress} size={8} scale={5} />
          <p>{getEllipsisTxt(walletAddress, 6)}</p>
        </div>
      )}

      <div className="signin-options">
        <Option
          icon="wallet"
          title="Connect a wallet"
          description="MetaMask, Rabby or any browser wallet. Needed to send tips."
          onClick={connectWallet}
        />
        {isGuest ? (
          <Option
            icon="logout"
            title="Sign out"
            description="Leave the guest session in this tab."
            onClick={disconnect}
          />
        ) : (
          <Option
            icon="user"
            title="Continue as guest"
            description="Ask, answer and vote with a temporary identity. No wallet needed."
            onClick={continueAsGuest}
          />
        )}
      </div>
    </Modal>
  );
}

export default SignIn;
