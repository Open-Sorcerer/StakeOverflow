import { useSearch } from "data";
import Post from "./Feed/components/Post";

/** Questions from every topic that mention the query, in their titles, bodies or replies. */
const SearchResults = ({ query }) => {
  const results = useSearch(query);
  const term = query.trim();

  return (
    <>
      <header className="feed-head rise">
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow">Search</span>
          <h1 className="display feed-title search-title">“{term}”</h1>
          <p className="feed-meta">
            {results.length} {results.length === 1 ? "question" : "questions"} across all topics
          </p>
        </div>
      </header>

      <div className="stack">
        {results.length ? (
          results.map((post, index) => (
            <Post key={post.postId} post={post} index={index} showTopic highlight={term} />
          ))
        ) : (
          <div className="bezel rise">
            <div className="bezel-core empty">
              <span className="eyebrow">No matches</span>
              <p className="empty-title">Nothing yet.</p>
              <p className="empty-copy">
                No question mentions “{term}”. Try fewer words, or ask it yourself.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;
