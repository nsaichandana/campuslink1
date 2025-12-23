import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/auth';
import { isProfileComplete } from '../../services/database';
import './HomeScreen.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, profile, isAnonymous, isAuthenticated, isAdmin, refreshProfile } = useAuth();

  // Refresh profile on mount to ensure we have latest data
  useEffect(() => {
    if (user && !isAnonymous) {
      refreshProfile();
    }
  }, [user, isAnonymous]);

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      navigate('/admin');
    }
  }, [isAdmin, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check if profile is complete using the helper function
  const hasCompleteProfile = isProfileComplete(profile);
  
  console.log('Profile data:', profile); // Debug
  console.log('Has complete profile:', hasCompleteProfile); // Debug

  const menuCards = [
    {
      id: 'report',
      title: 'Report a Campus Issue',
      description: 'Anonymously report safety, hygiene, infrastructure, or canteen concerns',
      icon: '🚨',
      action: () => navigate('/issues/report'),
      available: true
    },
    {
      id: 'mentor',
      title: 'Find a Mentor',
      description: 'Connect with students who have the skills you want to learn',
      icon: '🎓',
      action: () => {
        if (!hasCompleteProfile && isAuthenticated) {
          navigate('/profile-setup');
        } else {
          navigate('/mentorship');
        }
      },
      available: isAuthenticated,
      locked: !isAuthenticated
    },
    {
      id: 'activity',
      title: 'My Activity',
      description: 'View your reported issues, mentor connections, and messages',
      icon: '📋',
      action: () => navigate('/activity'),
      available: true
    }
  ];

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="container">
          <div className="home-header-content">
            <h1 className="home-title">CampusLink</h1>
            
            <div className="home-user-info">
              {isAuthenticated ? (
                <>
                  <span className="user-greeting">
                    {hasCompleteProfile
                      ? `${profile.department} • ${profile.year}`
                      : 'Profile Incomplete'
                    }
                  </span>
                  {!hasCompleteProfile && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/profile-setup')}
                    >
                      Complete Profile
                    </button>
                  )}
                  <button 
                    className="btn btn-text btn-sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : isAnonymous ? (
                <>
                  <span className="user-greeting text-muted">Anonymous User</span>
                  <button 
                    className="btn btn-text btn-sm"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="container">
          {!isAuthenticated && (
            <div className="alert alert-info home-alert">
              💡 Sign in with your college email to access mentorship and chat features
            </div>
          )}

          {isAuthenticated && !hasCompleteProfile && (
            <div className="alert alert-warning home-alert">
              ⚠️ Complete your profile to unlock mentorship features
            </div>
          )}

          <div className="home-cards">
            {menuCards.map((card) => (
              <div
                key={card.id}
                className={`card card-interactive home-card fade-in-up ${
                  card.locked ? 'home-card-locked' : ''
                }`}
                onClick={card.available ? card.action : undefined}
                style={{ animationDelay: `${menuCards.indexOf(card) * 0.1}s` }}
              >
                <div className="home-card-icon">{card.icon}</div>
                <h3 className="home-card-title">{card.title}</h3>
                <p className="home-card-description">{card.description}</p>
                
                {card.locked && (
                  <div className="home-card-lock">
                    <span className="tag tag-warning">🔒 Sign in required</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="home-tagline">
            <p>A safe space to speak up and learn from each other.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
