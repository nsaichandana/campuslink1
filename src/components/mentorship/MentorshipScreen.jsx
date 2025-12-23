import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { searchMentors } from '../../services/database';
import { parseSearchQuery } from '../../services/gemini';
import MentorCard from './MentorCard';
import './MentorshipScreen.css';

export default function MentorshipScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Auto-search based on user's wanted skills on mount
    if (profile?.skillsWanted && profile.skillsWanted.length > 0) {
      handleSearch(true);
    }
  }, []);

  const handleSearch = async (useProfileSkills = false) => {
    setLoading(true);
    setSearched(true);
    
    try {
      let skills = [];
      
      if (useProfileSkills && profile?.skillsWanted) {
        skills = profile.skillsWanted;
      } else if (searchQuery.trim()) {
        const parsed = await parseSearchQuery(searchQuery);
        skills = parsed.skills;
      } else {
        skills = profile?.skillsWanted || [];
      }
      
      const results = await searchMentors(user.uid, searchQuery, skills);
      setMentors(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentorship-screen">
      <div className="mentorship-header">
        <div className="container">
          <button 
            className="btn btn-text"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h2>Find a Mentor</h2>
          <p className="text-muted">
            Connect with students who have the skills you want to learn
          </p>
        </div>
      </div>

      <div className="mentorship-main">
        <div className="container">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                className="form-input"
                placeholder="Search by skills or interests (e.g., Python, Photography, Guitar)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="btn btn-primary"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="text-muted">Finding matches...</p>
            </div>
          )}

          {!loading && searched && mentors.length === 0 && (
            <div className="empty-state">
              <p className="text-muted">
                No mentors found. Try different skills or check back later.
              </p>
            </div>
          )}

          {!loading && mentors.length > 0 && (
            <div className="mentors-grid">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}

          {!searched && !loading && (
            <div className="welcome-message">
              <h3>Welcome to Mentorship Discovery</h3>
              <p className="text-muted">
                Search for skills you want to learn, or we'll suggest mentors based on your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
