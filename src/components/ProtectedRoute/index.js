import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, adminOnly, ...rest }) => {
  const token = localStorage.getItem("token");

  // Logging token for debugging
  console.log('Token:', token);

  if (!token) {
    return <Redirect to="/login" />;
  }

  let userRole;
  try {
    // Decode the token and extract role
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    userRole = decodedToken.role;
  } catch (error) {
    // Handle error if decoding fails
    console.error('Failed to decode token:', error);
    return <Redirect to="/login" />;
  }

  // Logging user role for debugging
  console.log('User Role:', userRole);

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
