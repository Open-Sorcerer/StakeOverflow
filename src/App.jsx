import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { useSession } from "providers/DappProvider";
import Nav from "components/Nav";
import Landing from "components/Landing";
import Main from "components/Main";
import Icon from "components/ui/Icon";
import "./style.css";

const App = () => {
  const { isAuthenticated, isRestoring } = useSession();

  return (
    <Router>
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="page">
        <Nav />
        {/* Wait for wagmi to restore a previous connection before deciding where to route. */}
        {isRestoring && (
          <div className="restoring" role="status" aria-label="Reconnecting your wallet">
            <Icon name="loader" size={22} className="spin" />
          </div>
        )}
        {!isRestoring && (
          <Switch>
            <Route path="/app">{isAuthenticated ? <Main /> : <Redirect to="/" />}</Route>
            <Route path="/">{isAuthenticated ? <Redirect to="/app" /> : <Landing />}</Route>
          </Switch>
        )}
      </div>
    </Router>
  );
};

export default App;
