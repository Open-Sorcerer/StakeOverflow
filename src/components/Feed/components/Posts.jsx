import { useDapp } from "providers/DappProvider";
import PillButton from "components/ui/PillButton";
import Post, { PostSkeleton } from "./Post";

const Posts = ({ posts, isLoading, onAsk }) => {
  const { selectedCategory } = useDapp();

  if (isLoading) return [0, 1, 2].map((i) => <PostSkeleton key={i} />);

  if (posts.length === 0) {
    return (
      <div className="bezel rise">
        <div className="bezel-core empty">
          <span className="eyebrow">{selectedCategory.category}</span>
          <p className="empty-title">Quiet in here.</p>
          <p className="empty-copy">
            No one has asked anything yet. The first question in a topic sets the tone.
          </p>
          <PillButton icon="plus" onClick={onAsk}>
            Ask the first question
          </PillButton>
        </div>
      </div>
    );
  }

  return posts.map((post, index) => <Post key={post.postId} post={post} index={index} />);
};

export default Posts;
