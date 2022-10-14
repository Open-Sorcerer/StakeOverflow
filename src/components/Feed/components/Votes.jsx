import { useState } from "react";
import { message } from "antd";
import { useDapp } from "providers/DappProvider";
import { useForumActions, usePostVotes } from "data";
import { sameAddress } from "helpers/content";
import { readableError } from "helpers/errors";
import Icon from "components/ui/Icon";

const Votes = ({ post, inline = false }) => {
  const { walletAddress } = useDapp();
  const { count, myVote } = usePostVotes(post.postId);
  const { vote } = useForumActions();
  const [pending, setPending] = useState(null);
  const isOwn = sameAddress(post.postOwner, walletAddress);

  async function cast(direction) {
    if (isOwn) return message.info("You can't vote on your own post.");
    if (myVote) return message.info("You've already voted on this post.");
    setPending(direction);
    try {
      const weight = await vote(post.postId, direction);
      const points = `${weight} ${weight === 1 ? "point" : "points"}`;
      // voteDown floors the author's reputation at 0, so a downvote can take less.
      message.success(
        direction === "up"
          ? `Upvoted · author gains ${points} of reputation`
          : `Downvoted · author loses up to ${points} of reputation`
      );
    } catch (error) {
      message.error(readableError(error));
    }
    setPending(null);
  }

  const iconSize = inline ? 17 : 20;

  return (
    <div className={inline ? "vote-inline" : "vote-rail"}>
      <button
        type="button"
        className={`vote-btn ${myVote === "up" ? "is-up" : ""}`}
        aria-label="Vote up"
        aria-pressed={myVote === "up"}
        disabled={Boolean(pending)}
        onClick={() => cast("up")}
      >
        <Icon
          name={pending === "up" ? "loader" : "chevronUp"}
          size={iconSize}
          className={pending === "up" ? "spin" : undefined}
        />
      </button>
      <span className="vote-count" key={count} aria-label={`${count} votes`}>
        {count}
      </span>
      <button
        type="button"
        className={`vote-btn ${myVote === "down" ? "is-down" : ""}`}
        aria-label="Vote down"
        aria-pressed={myVote === "down"}
        disabled={Boolean(pending)}
        onClick={() => cast("down")}
      >
        <Icon
          name={pending === "down" ? "loader" : "chevronDown"}
          size={iconSize}
          className={pending === "down" ? "spin" : undefined}
        />
      </button>
    </div>
  );
};

export default Votes;
