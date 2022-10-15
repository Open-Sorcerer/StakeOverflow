import { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useDapp } from "providers/DappProvider";
import Icon from "./ui/Icon";
import Reputation from "./Reputation";
import { useOpenTopic } from "./navigation";

const isTyping = (element) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element?.isContentEditable;

function SearchField() {
  const history = useHistory();
  const { searchQuery, setSearchQuery } = useDapp();
  const inputRef = useRef(null);

  // "/" focuses search from anywhere, unless you're already typing.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || isTyping(document.activeElement)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onChange(value) {
    setSearchQuery(value);
    // Results show in the main view, so leave a profile page when a search starts.
    if (value.trim() && history.location.pathname !== "/app") history.push("/app");
  }

  return (
    <label className="search-field">
      <Icon name="search" size={16} />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search questions"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            e.currentTarget.blur();
          }
        }}
        aria-label="Search questions"
      />
      {searchQuery ? (
        <button type="button" className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
          <Icon name="close" size={14} />
        </button>
      ) : (
        <kbd>/</kbd>
      )}
    </label>
  );
}

const Categories = ({ categories, isLoading }) => {
  const { selectedCategory, searchQuery } = useDapp();
  const openTopic = useOpenTopic();
  const selectedId = searchQuery.trim() ? null : selectedCategory?.categoryId;

  return (
    <aside className="sidebar rise">
      <div className="bezel">
        <div className="bezel-core">
          <SearchField />
          <div className="sidebar-head">
            <span className="eyebrow">Topics</span>
            <span className="sidebar-count">{String(categories.length).padStart(2, "0")}</span>
          </div>
          <nav className="topic-list" aria-label="Topics">
            <button
              type="button"
              className={`topic ${selectedId || searchQuery.trim() ? "" : "is-active"}`}
              onClick={() => openTopic(null)}
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
                onClick={() => openTopic(category)}
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
