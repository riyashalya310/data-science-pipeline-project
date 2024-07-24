import { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import { useHistory } from "react-router-dom";

import "./App.css";
// import InputModule from "./components/InputModule";
import AnalysisModule from "./components/AnalysisModule";
import ViewModule from "./components/ViewModule";
import NotFound from "./components/NotFound";

function App() {
  const [state, changeState] = useState({
    file: null,
  });

  const onChangeState = (file) => {
    changeState({
      file,
    });
    console.log(file);
  };

  return (
    <Router>
      <Switch>
        {/* <Route
          exact
          path="/"
          render={(props) => <InputModule {...props} onChangeState={onChangeState} />}
        /> */}
        <Route
          exact
          path="/"
          render={(props) => <ViewModule {...props} state={state} />}
        />
        <Route path="/view" component={ViewModule} />
        <Route exact path="/analysis" component={AnalysisModule} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;