import { usePostContent } from "data";
import Composer from "./Composer";
import Votes from "./Votes";
import Tip from "./Tip";
import { PostMeta } from "./Post";

const Reply = ({ reply }) => {
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
    <div className="reply rise">
      <PostMeta post={reply} />
      <p className="post-body">{error ? "This reply couldn't be loaded." : content.content}</p>
      {content?.image && <img className="post-image" src={content.image} alt="" loading="lazy" />}
      <div className="reply-foot">
        <Votes post={reply} inline />
        <Tip post={reply} />
      </div>
    </div>
  );
};

const Replies = ({ parentId, replies }) => (
  <div className="thread">
    {replies.map((reply) => (
      <Reply key={reply.postId} reply={reply} />
    ))}
    <Composer parentId={parentId} />
  </div>
);

export default Replies;
