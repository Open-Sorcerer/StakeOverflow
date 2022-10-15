import { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { useDapp } from "providers/DappProvider";
import { useCategories } from "data";
import Categories from "./Categories";
import Overview from "./Overview";
import Feed from "./Feed";
import SearchResults from "./SearchResults";
import Profile from "./Profile";
import { preloadMarkdown } from "./ui/Markdown";

const Main = () => {
  const { selectedCategory, searchQuery } = useDapp();
  const { categories, isLoading } = useCategories();

  // Posts render markdown; fetch the renderer as soon as the app opens.
  useEffect(() => {
    preloadMarkdown();
  }, []);

  let content;
  if (searchQuery.trim()) content = <SearchResults query={searchQuery} />;
  else if (selectedCategory) content = <Feed key={selectedCategory.categoryId} />;
  else content = <Overview categories={categories} isLoading={isLoading} />;

  return (
    <main className="app-shell">
      <Categories categories={categories} isLoading={isLoading} />
      <section aria-live="polite">
        <Switch>
          <Route path="/app/u/:address">
            <Profile />
          </Route>
          <Route>{content}</Route>
        </Switch>
      </section>
    </main>
  );
};

export default Main;
