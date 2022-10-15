import { useState } from "react";
import { useDapp } from "providers/DappProvider";
import { usePosts } from "data";
import PillButton from "components/ui/PillButton";
import Composer from "./components/Composer";
import Posts from "./components/Posts";

const SORTS = [
  { id: "newest", label: "Newest", meta: "newest first" },
  { id: "top", label: "Top", meta: "most votes first" },
  { id: "unanswered", label: "Unanswered", meta: "waiting for a reply" },
];

const Feed = () => {
  const { selectedCategory } = useDapp();
  const [sort, setSort] = useState("newest");
  const { posts, isLoading } = usePosts(selectedCategory.categoryId, sort);
  const [isComposing, setIsComposing] = useState(false);
  const current = SORTS.find((option) => option.id === sort);

  return (
    <>
      <header className="feed-head rise">
        <div>
          <span className="eyebrow">Topic</span>
          <h1 className="display feed-title">{selectedCategory.category}</h1>
          <p className="feed-meta">
            {isLoading
              ? "Loading questions…"
              : `${posts.length} ${posts.length === 1 ? "question" : "questions"} · ${current.meta}`}
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

      <div className="feed-toolbar rise">
        <div className="segmented" role="tablist" aria-label="Sort questions">
          {SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={sort === option.id}
              className={sort === option.id ? "is-active" : ""}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stack" key={sort}>
        {isComposing && <Composer onDone={() => setIsComposing(false)} />}
        <Posts
          posts={posts}
          isLoading={isLoading}
          onAsk={() => setIsComposing(true)}
          empty={
            sort === "unanswered"
              ? {
                  title: "All caught up.",
                  copy: "Every question in this topic has at least one reply.",
                }
              : undefined
          }
        />
      </div>
    </>
  );
};

export default Feed;
