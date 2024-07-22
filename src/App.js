import { useState } from "react";
import { BrowserRouter,Route,Switch } from "react-router-dom";
import "./App.css";
import InputModule from "./components/InputModule";
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
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={(props) => <InputModule {...props} onChangeState={onChangeState} />} />
        <Route exact path="/view" render={(props) => <ViewModule {...props} state={state} />} />
        <Route exact path="/analysis" component={AnalysisModule} />
        <Route path="*" component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
