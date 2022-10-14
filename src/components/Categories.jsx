import { useDapp } from "providers/DappProvider";
import Reputation from "./Reputation";

const Categories = ({ categories, isLoading }) => {
  const { selectedCategory, setSelectedCategory } = useDapp();
  const selectedId = selectedCategory?.categoryId;

  return (
    <aside className="sidebar rise">
      <div className="bezel">
        <div className="bezel-core">
          <div className="sidebar-head">
            <span className="eyebrow">Topics</span>
            <span className="sidebar-count">{String(categories.length).padStart(2, "0")}</span>
          </div>
          <nav className="topic-list" aria-label="Topics">
            <button
              type="button"
              className={`topic ${selectedId ? "" : "is-active"}`}
              onClick={() => setSelectedCategory(null)}
            >
              <span className="topic-dot" />
              Overview
            </button>
            {isLoading &&
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 18, margin: "12px 14px" }} />
              ))}
            {categories.map((category) => (
              <button
                type="button"
                key={category.categoryId}
                className={`topic ${category.categoryId === selectedId ? "is-active" : ""}`}
                aria-current={category.categoryId === selectedId ? "page" : undefined}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="topic-dot" />
                {category.category}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {selectedCategory && <Reputation />}
    </aside>
  );
};

export default Categories;
