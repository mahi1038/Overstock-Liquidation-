
// AuthBox.jsx
import React, { useState } from 'react';
import './AuthBox.css';

function AuthBox() {
  const [mode, setMode] = useState('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className={`auth-container ${mode}`}>      
      <div className="auth-toggle">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
      </div>
      <div className="auth-box">
        {mode === 'login' ? (
          <form className="auth-form">
            <h2>Welcome Back</h2>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form className="auth-form">
            <h2>Create Account</h2>
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthBox;
