import { useHistory } from "react-router-dom";
import { useDapp } from "providers/DappProvider";

/** Opens a topic (or the overview, for null) from anywhere: leaves profiles and clears search. */
export function useOpenTopic() {
  const history = useHistory();
  const { setSelectedCategory, setSearchQuery } = useDapp();

  return (category, { focusPostId } = {}) => {
    setSelectedCategory(category);
    setSearchQuery("");
    if (history.location.pathname !== "/app") history.push("/app");
    if (!focusPostId) window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

export const profilePath = (address) => `/app/u/${address.toLowerCase()}`;
