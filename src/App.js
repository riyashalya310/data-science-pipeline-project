import { useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import InputModule from './components/InputModule';
import ViewModule from './components/ViewModule';
import AnalysisModule from './components/AnalysisModule';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

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
        <Route exact path='/signup' component={Signup} />
        <Route exact path='/login' component={Login} />
        <Route path='/admin/dashboard' component={AdminDashboard} adminOnly />
        <Route exact path="/" render={(props) => <InputModule {...props} onChangeState={onChangeState} />} />
        <Route exact path="/view" render={(props) => <ViewModule {...props} state={state} />} />
        <Route exact path="/analysis" component={AnalysisModule} />
        <Route path="*" component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
