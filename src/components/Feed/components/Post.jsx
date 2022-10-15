import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDapp } from "providers/DappProvider";
import { useCategories, usePostContent, useReplies } from "data";
import { getEllipsisTxt } from "helpers/formatters";
import { sameAddress, timeAgo } from "helpers/content";
import Blockie from "components/Blockie";
import Icon from "components/ui/Icon";
import Markdown from "components/ui/Markdown";
import { profilePath } from "components/navigation";
import Votes from "./Votes";
import Tip from "./Tip";
import Replies from "./Replies";

/** Author, time, and optionally the topic and a "Solved" badge. */
export const PostMeta = ({ post, showTopic = false, isSolved = false }) => {
  const { walletAddress } = useDapp();
  const { categories } = useCategories();
  const topic = showTopic && categories.find((c) => c.categoryId === post.categoryId);

  return (
    <div className="post-meta">
      <Link className="author-link" to={profilePath(post.postOwner)} title={post.postOwner}>
        <Blockie address={post.postOwner} scale={2.5} />
        <span>{getEllipsisTxt(post.postOwner, 4)}</span>
      </Link>
      {sameAddress(post.postOwner, walletAddress) && <span className="you-badge">You</span>}
      {post.createdAt && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(post.createdAt).toISOString()}>{timeAgo(post.createdAt)}</time>
        </>
      )}
      {topic && <span className="topic-tag">{topic.category}</span>}
      {isSolved && (
        <span className="solved-badge">
          <Icon name="checkCircle" size={13} />
          Solved
        </span>
      )}
    </div>
  );
};

export const PostSkeleton = () => (
  <div className="bezel">
    <div className="bezel-core post-core">
      <div className="skeleton" style={{ width: 28, height: 72, margin: "0 auto" }} />
      <div>
        <div className="skeleton" style={{ width: 140, height: 12 }} />
        <div className="skeleton" style={{ width: "72%", height: 20, marginTop: 18 }} />
        <div className="skeleton" style={{ width: "94%", height: 12, marginTop: 16 }} />
        <div className="skeleton" style={{ width: "58%", height: 12, marginTop: 10 }} />
      </div>
    </div>
  </div>
);

/** Wraps case-insensitive matches of `query` in <mark>. */
const Highlight = ({ text, query }) => {
  const needle = query?.trim();
  if (!needle) return text;
  const parts = text.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === needle.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
};

const Post = ({ post, index = 0, showTopic = false, highlight }) => {
  const { content, error } = usePostContent(post.contentId);
  const { replies } = useReplies(post.postId);
  const { focusPostId, setFocusPostId } = useDapp();
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const ref = useRef(null);

  // Opened from elsewhere (e.g. an answer on a profile): open the thread and bring it into view.
  useEffect(() => {
    if (focusPostId !== post.postId || !ref.current) return;
    setIsThreadOpen(true);
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusPostId(null);
  }, [focusPostId, post.postId, setFocusPostId, content]);

  if (!content && !error) return <PostSkeleton />;

  return (
    <article
      ref={ref}
      className="bezel rise post"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="bezel-core post-core">
        <Votes post={post} />
        <div style={{ minWidth: 0 }}>
          <PostMeta post={post} showTopic={showTopic} isSolved={Boolean(post.acceptedReplyId)} />
          {error ? (
            <p className="post-body" style={{ marginTop: 12 }}>
              This question couldn't be loaded.
            </p>
          ) : (
            <>
              <h3 className="post-title">
                <Highlight text={content.title} query={highlight} />
              </h3>
              <Markdown className="post-body">{content.content}</Markdown>
              {content.image && (
                <img className="post-image" src={content.image} alt="" loading="lazy" />
              )}
            </>
          )}

          <div className="post-actions">
            <button
              type="button"
              className={`action ${isThreadOpen ? "is-active" : ""}`}
              aria-expanded={isThreadOpen}
              onClick={() => setIsThreadOpen(!isThreadOpen)}
            >
              <Icon name="reply" size={16} />
              {replies.length
                ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`
                : "Reply"}
            </button>
            <Tip post={post} />
          </div>

          {isThreadOpen && <Replies question={post} replies={replies} />}
        </div>
      </div>
    </article>
  );
};

export default Post;
