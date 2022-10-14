import { useState } from "react";
import { useDapp } from "providers/DappProvider";
import { usePostContent, useReplies } from "data";
import { getEllipsisTxt } from "helpers/formatters";
import { sameAddress, timeAgo } from "helpers/content";
import Blockie from "components/Blockie";
import Icon from "components/ui/Icon";
import Votes from "./Votes";
import Tip from "./Tip";
import Replies from "./Replies";

export const PostMeta = ({ post }) => {
  const { walletAddress } = useDapp();
  return (
    <div className="post-meta">
      <Blockie address={post.postOwner} scale={2.5} />
      <span title={post.postOwner}>{getEllipsisTxt(post.postOwner, 4)}</span>
      {sameAddress(post.postOwner, walletAddress) && <span className="you-badge">You</span>}
      {post.createdAt && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(post.createdAt).toISOString()}>{timeAgo(post.createdAt)}</time>
        </>
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

const Post = ({ post, index = 0 }) => {
  const { content, error } = usePostContent(post.contentId);
  const { replies } = useReplies(post.postId);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  if (!content && !error) return <PostSkeleton />;

  return (
    <article className="bezel rise" style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
      <div className="bezel-core post-core">
        <Votes post={post} />
        <div style={{ minWidth: 0 }}>
          <PostMeta post={post} />
          {error ? (
            <p className="post-body" style={{ marginTop: 12 }}>
              This question couldn't be loaded.
            </p>
          ) : (
            <>
              <h3 className="post-title">{content.title}</h3>
              <p className="post-body">{content.content}</p>
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

          {isThreadOpen && <Replies parentId={post.postId} replies={replies} />}
        </div>
      </div>
    </article>
  );
};

export default Post;
