import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import './index.css'; // Ensure this path is correct

const Signup = ({ history }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/signup', {
        name,
        email,
        password
      });
      setMessage(response.data.message);
      history.replace('/login')
    } catch (err) {
      setError('Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="signup-title">Signup</h2>
          <div style={{display: "flex",flexDirection : "row",justifyContent: "center"}}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse?.credential);
              setEmail(decoded.email);
              setName(decoded.given_name+' '+decoded.family_name);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <p className="switch-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
