import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import axios from "axios";
import './index.css'; // Update the CSS import to the new file

const Login = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5001/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userRole = decodedToken.role;

      dispatch(setUser({ email, role: userRole }));

      if (userRole === "admin") {
        history.push("/admin/dashboard");
      } else {
        history.push("/");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Login</button>
          <p className="switch-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default withRouter(Login);
