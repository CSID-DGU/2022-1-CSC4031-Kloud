import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import { useRecoilValue } from "recoil";
import { isLoggedInAtom } from "./atoms";

const Router = () => {
  const isLoggedIn = useRecoilValue(isLoggedInAtom);
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/">{isLoggedIn ? <Home /> : <Login />}</Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
