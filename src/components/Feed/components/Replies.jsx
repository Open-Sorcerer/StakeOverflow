import { useState } from "react";
import { message } from "antd";
import { useDapp } from "providers/DappProvider";
import { useForumActions, usePostContent } from "data";
import { sameAddress } from "helpers/content";
import { readableError } from "helpers/errors";
import Icon from "components/ui/Icon";
import Markdown from "components/ui/Markdown";
import Composer from "./Composer";
import Votes from "./Votes";
import Tip from "./Tip";
import { PostMeta } from "./Post";

/** The asker's control for marking (or un-marking) a reply as the accepted answer. */
const AcceptButton = ({ question, reply, isAccepted }) => {
  const { acceptAnswer } = useForumActions();
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    setIsPending(true);
    try {
      const { accepting, reward } = await acceptAnswer(question.postId, reply.postId);
      if (!accepting) message.success("Answer un-accepted");
      else if (reward) message.success(`Accepted · author gains ${reward} points of reputation`);
      else message.success("Accepted");
    } catch (error) {
      message.error(readableError(error));
    }
    setIsPending(false);
  }

  return (
    <button
      type="button"
      className={`action accept-action ${isAccepted ? "is-active" : ""}`}
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isAccepted}
      title={isAccepted ? "Un-accept this answer" : "Mark as the accepted answer"}
    >
      <Icon name={isPending ? "loader" : "checkCircle"} size={16} className={isPending ? "spin" : undefined} />
      {isAccepted ? "Accepted" : "Accept"}
    </button>
  );
};

const Reply = ({ question, reply, isAccepted, canAccept }) => {
  const { content, error } = usePostContent(reply.contentId);

  if (!content && !error) {
    return (
      <div className="reply">
        <div className="skeleton" style={{ width: 120, height: 12 }} />
        <div className="skeleton" style={{ width: "80%", height: 12, marginTop: 14 }} />
      </div>
    );
  }

  return (
    <div className={`reply rise ${isAccepted ? "is-accepted" : ""}`}>
      {isAccepted && (
        <span className="accepted-badge">
          <Icon name="checkCircle" size={14} />
          Accepted answer
        </span>
      )}
      <PostMeta post={reply} />
      {error ? (
        <p className="post-body">This reply couldn't be loaded.</p>
      ) : (
        <Markdown className="post-body">{content.content}</Markdown>
      )}
      {content?.image && <img className="post-image" src={content.image} alt="" loading="lazy" />}
      <div className="reply-foot">
        <Votes post={reply} inline />
        <Tip post={reply} />
        {canAccept && <AcceptButton question={question} reply={reply} isAccepted={isAccepted} />}
      </div>
    </div>
  );
};

const Replies = ({ question, replies }) => {
  const { walletAddress } = useDapp();
  const canAccept = sameAddress(question.postOwner, walletAddress);
  // The accepted answer leads the thread; the rest stay in posting order.
  const ordered = [...replies].sort(
    (a, b) =>
      (b.postId === question.acceptedReplyId) - (a.postId === question.acceptedReplyId)
  );

  return (
    <div className="thread">
      {ordered.map((reply) => (
        <Reply
          key={reply.postId}
          question={question}
          reply={reply}
          isAccepted={reply.postId === question.acceptedReplyId}
          canAccept={canAccept}
        />
      ))}
      <Composer parentId={question.postId} />
    </div>
  );
};

export default Replies;
