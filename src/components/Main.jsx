import { useDapp } from "providers/DappProvider";
import { useCategories } from "data";
import Categories from "./Categories";
import Overview from "./Overview";
import Feed from "./Feed";

const Main = () => {
  const { selectedCategory } = useDapp();
  const { categories, isLoading } = useCategories();

  return (
    <main className="app-shell">
      <Categories categories={categories} isLoading={isLoading} />
      <section aria-live="polite">
        {selectedCategory ? (
          <Feed key={selectedCategory.categoryId} />
        ) : (
          <Overview categories={categories} isLoading={isLoading} />
        )}
      </section>
    </main>
  );
};

export default Main;
