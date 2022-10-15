import { Link, useLocation } from "react-router-dom";
import Logo from "./ui/Logo";
import Wallet from "./Wallet";
import { useOpenTopic } from "./navigation";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Nav() {
  const { pathname } = useLocation();
  const openTopic = useOpenTopic();
  const onLanding = !pathname.startsWith("/app");

  return (
    <header className="nav">
      <div className="nav-brand">
        <Link
          to="/"
          onClick={() => openTopic(null)}
          aria-label="StakeOverflow home"
        >
          <Logo />
        </Link>
      </div>

      {onLanding && (
        <nav className="nav-links" aria-label="Sections">
          <button type="button" className="nav-link" onClick={() => scrollTo("how")}>
            How it works
          </button>
          <button type="button" className="nav-link" onClick={() => scrollTo("reputation")}>
            Reputation
          </button>
          <a
            className="nav-link"
            href="https://github.com/Open-Sorcerer/DeStackOverflow"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      )}

      <div className="nav-actions">
        <Wallet />
      </div>
    </header>
  );
}

export default Nav;
