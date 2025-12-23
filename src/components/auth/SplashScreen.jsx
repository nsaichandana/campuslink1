import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="splash-screen">
      <div className="splash-content fade-in-up">
        <div className="splash-logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="3"/>
            <path d="M25 45L35 35L45 45L55 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="35" cy="28" r="3" fill="currentColor"/>
            <circle cx="55" cy="28" r="3" fill="currentColor"/>
          </svg>
        </div>
        
        <h1 className="splash-title">CampusLink</h1>
        
        <p className="splash-tagline">
          A safe space to speak up<br/>and learn from each other.
        </p>
        
        <button 
          className="btn btn-primary btn-block splash-cta"
          onClick={() => navigate('/auth')}
        >
          Continue
        </button>
        
        <p className="splash-footer">
          College-only platform • Safe & moderated
        </p>
      </div>
    </div>
  );
}
