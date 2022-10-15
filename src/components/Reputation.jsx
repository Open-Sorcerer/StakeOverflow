import { Link } from "react-router-dom";
import { useDapp } from "providers/DappProvider";
import { useReputation } from "data";
import { voteWeight } from "helpers/reputation";
import Icon from "./ui/Icon";
import { profilePath } from "./navigation";

const Reputation = () => {
  const { selectedCategory, walletAddress } = useDapp();
  const reputation = useReputation(selectedCategory.categoryId);
  const weight = reputation === null ? null : voteWeight(reputation);

  return (
    <div className="bezel rise rep-shell">
      <div className="bezel-core rep-card">
        <span className="eyebrow">Your reputation</span>
        <div className="rep-value" key={reputation}>
          {reputation ?? "–"}
        </div>
        <p className="rep-caption">
          in {selectedCategory.category}.
          {weight !== null &&
            ` Your upvotes here add ${weight} ${weight === 1 ? "point" : "points"} to an author's reputation; downvotes take up to ${weight}.`}
        </p>
        {walletAddress && (
          <Link className="profile-link" to={profilePath(walletAddress)}>
            View your profile
            <Icon name="arrowUpRight" size={14} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Reputation;
