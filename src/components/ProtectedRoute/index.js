import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, adminOnly, ...rest }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Redirect to="/login" />;
  }

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const userRole = decodedToken.role;

  return (
    <Route
      {...rest}
      render={(props) =>
        (!adminOnly || userRole === "admin") ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default ProtectedRoute;
