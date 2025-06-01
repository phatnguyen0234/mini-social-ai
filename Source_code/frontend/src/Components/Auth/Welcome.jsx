import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcome.css';
import phoneMockup from "../../assets/phone.png";

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login', { replace: true });
  };

  const handleSignUp = () => {
    navigate('/register', { replace: true });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Reddat</h1>
        <span className="beta-tag">BETA</span>
        <p className="welcome-subtitle">Definitely not Reddit</p>
        
        <div className="phone-mockup-container">
          <img src={phoneMockup} alt="Phone mockup" className="phone-mockup" />
        </div>

        <div className="welcome-buttons">
          <button onClick={handleSignIn} className="welcome-button signin">
            Sign in
          </button>
          <button onClick={handleSignUp} className="welcome-button signup">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 