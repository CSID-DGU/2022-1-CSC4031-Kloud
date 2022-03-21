import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./route/Home";
import Login from "./route/Login";

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          {/* 로그인 O -> 홈화면 
            로그인 X -> 로그인화면 */}
          <Login></Login>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
