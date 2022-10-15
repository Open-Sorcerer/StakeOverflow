import Icon from "./ui/Icon";
import { useOpenTopic } from "./navigation";

const Overview = ({ categories, isLoading }) => {
  const openTopic = useOpenTopic();
  // The first tile spans two columns; the last one stretches to close its row.
  const lastSpan = 3 - (categories.length % 3);

  return (
    <>
      <header className="feed-head rise">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="display feed-title">
            Pick a <em>topic</em>.
          </h1>
          <p className="feed-meta">
            Reputation is earned per topic. Start where you know the most.
          </p>
        </div>
      </header>

      {!isLoading && categories.length === 0 ? (
        <div className="bezel rise">
          <div className="bezel-core empty">
            <span className="eyebrow">No topics yet</span>
            <p className="empty-title">Nothing to browse.</p>
            <p className="empty-copy">
              Topics will appear here as soon as the first one is created.
            </p>
          </div>
        </div>
      ) : (
        <div className="tiles">
          {categories.map((category, index) => (
            <button
              type="button"
              key={category.categoryId}
              className={`bezel tile rise ${index === categories.length - 1 ? "is-last" : ""}`}
              style={{ animationDelay: `${index * 70}ms`, "--last-span": lastSpan }}
              onClick={() => openTopic(category)}
            >
              <div className="bezel-core">
                <span className="card-kicker">{String(index + 1).padStart(2, "0")}</span>
                <div className="tile-foot">
                  <span className="tile-name">{category.category}</span>
                  <span className="tile-arrow">
                    <Icon name="arrowUpRight" size={17} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Overview;
