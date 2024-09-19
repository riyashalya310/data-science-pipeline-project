import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; // Update the CSS import to the new file

const Signup = ({ history }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/signup', {
        name,
        email,
        password
      });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError('Error signing up');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="signup-title">Signup</h2>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">Sign Up</button>
          <p className="switch-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
