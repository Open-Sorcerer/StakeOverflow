import { useState } from "react";
import { useDapp } from "providers/DappProvider";
import { usePosts } from "data";
import PillButton from "components/ui/PillButton";
import Composer from "./components/Composer";
import Posts from "./components/Posts";

const Feed = () => {
  const { selectedCategory } = useDapp();
  const { posts, isLoading } = usePosts(selectedCategory.categoryId);
  const [isComposing, setIsComposing] = useState(false);

  return (
    <>
      <header className="feed-head rise">
        <div>
          <span className="eyebrow">Topic</span>
          <h1 className="display feed-title">{selectedCategory.category}</h1>
          <p className="feed-meta">
            {isLoading
              ? "Loading questions…"
              : `${posts.length} ${posts.length === 1 ? "question" : "questions"} · newest first`}
          </p>
        </div>
        <PillButton
          icon={isComposing ? "close" : "plus"}
          variant={isComposing ? "ghost" : "primary"}
          onClick={() => setIsComposing(!isComposing)}
        >
          {isComposing ? "Close" : "Ask a question"}
        </PillButton>
      </header>

      <div className="stack">
        {isComposing && <Composer onDone={() => setIsComposing(false)} />}
        <Posts posts={posts} isLoading={isLoading} onAsk={() => setIsComposing(true)} />
      </div>
    </>
  );
};

export default Feed;
