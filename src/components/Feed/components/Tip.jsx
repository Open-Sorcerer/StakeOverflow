import { useEffect, useState } from "react";
import { message } from "antd";
import { parseEther } from "viem";
import { useDapp } from "providers/DappProvider";
import { useForumActions } from "data";
import { sameAddress } from "helpers/content";
import { getEllipsisTxt } from "helpers/formatters";
import { readableError } from "helpers/errors";
import { SUPPORTED_CHAIN } from "config";
import Icon from "components/ui/Icon";

/** Plain decimal with at most 18 places, the precision parseEther keeps without rounding. */
const DECIMAL = /^(\d+\.?\d{0,18}|\.\d{1,18})$/;

/** Amount in wei, or null unless it is a plain decimal above zero. */
const toWei = (amount) => {
  const text = amount.trim();
  if (!DECIMAL.test(text)) return null;
  const wei = parseEther(text);
  return wei > BigInt(0) ? wei : null;
};

/**
 * Sends native currency straight to the post's author. The contract has no
 * donate() function, so this is a plain transfer with nothing recorded on-chain.
 */
const Tip = ({ post }) => {
  const { walletAddress } = useDapp();
  const { tip } = useForumActions();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isOwn = sameAddress(post.postOwner, walletAddress);

  // A different account may own this post, so start over when the wallet switches.
  useEffect(() => setIsOpen(false), [walletAddress]);

  async function onSend(e) {
    e.preventDefault();
    if (isOwn) {
      message.error("You can't tip your own post.");
      return;
    }
    const valueWei = toWei(amount);
    if (!valueWei) {
      message.error("Enter an amount above zero, up to 18 decimal places.");
      return;
    }
    setIsSending(true);
    try {
      const hash = await tip(post.postOwner, valueWei);
      message.success(
        <span>
          Sent {amount} {SUPPORTED_CHAIN.currency} to {getEllipsisTxt(post.postOwner, 4)} ·{" "}
          <a href={`${SUPPORTED_CHAIN.explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
            View transaction
          </a>
        </span>,
        6
      );
      setAmount("");
      setIsOpen(false);
    } catch (error) {
      message.error(readableError(error));
    }
    setIsSending(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="action"
        disabled={isOwn}
        title={isOwn ? "You can't tip your own post" : `Tip the author in ${SUPPORTED_CHAIN.currency}`}
        onClick={() => setIsOpen(true)}
      >
        <Icon name="coin" size={16} />
        Tip
      </button>
    );
  }

  return (
    <form
      className="tip-form rise"
      onSubmit={onSend}
      onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
    >
      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        placeholder="0.5"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        aria-label={`Tip amount in ${SUPPORTED_CHAIN.currency}`}
        autoFocus
      />
      <span className="tip-unit">{SUPPORTED_CHAIN.currency}</span>
      <button
        type="button"
        className="action"
        style={{ padding: "0 8px" }}
        onClick={() => setIsOpen(false)}
        aria-label="Cancel tip"
      >
        <Icon name="close" size={14} />
      </button>
      <button type="submit" className="tip-send" disabled={isSending} aria-label="Send tip">
        <Icon name={isSending ? "loader" : "send"} size={15} className={isSending ? "spin" : undefined} />
      </button>
    </form>
  );
};

export default Tip;
