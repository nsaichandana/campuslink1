import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createProfile } from '../../services/database';
import './ProfileSetup.css';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics',
  'Business Administration',
  'Arts & Humanities',
  'Sciences',
  'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    skillsHave: '',
    skillsToLearn: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profileData = {
        department: formData.department,
        year: formData.year,
        skillsHave: formData.skillsHave
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
        skillsToLearn: formData.skillsToLearn
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
        bio: formData.bio
      };

      if (profileData.bio.length > 120) {
        throw new Error('Bio must be 120 characters or less');
      }

      if (profileData.skillsHave.length === 0) {
        throw new Error('Please add at least one skill you have');
      }

      if (profileData.skillsToLearn.length === 0) {
        throw new Error('Please add at least one skill you want to learn');
      }

      await createProfile(user.uid, profileData);
      
      // Wait a moment for Firestore to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh profile to load the newly created data
      await refreshProfile();
      
      // Navigate to home
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="profile-setup-screen">
      <div className="profile-setup-container fade-in-up">
        <div className="profile-setup-header">
          <h2>Set Up Your Profile</h2>
          <p className="text-muted">
            Help others know what you can offer and what you're looking to learn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              required
            >
              <option value="">Select your department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              required
            >
              <option value="">Select your year</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Skills You Have</label>
            <input
              type="text"
              className="form-input"
              placeholder="Python, Web Design, Public Speaking"
              value={formData.skillsHave}
              onChange={(e) => handleChange('skillsHave', e.target.value)}
              required
            />
            <p className="form-helper">
              Separate skills with commas
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Skills You Want to Learn</label>
            <input
              type="text"
              className="form-input"
              placeholder="Machine Learning, Photography, Guitar"
              value={formData.skillsToLearn}
              onChange={(e) => handleChange('skillsToLearn', e.target.value)}
              required
            />
            <p className="form-helper">
              Separate skills with commas
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Bio (max 120 characters)</label>
            <textarea
              className="form-textarea"
              placeholder="Be honest. This is not LinkedIn."
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              maxLength={120}
              required
              style={{ minHeight: '80px' }}
            />
            <p className="form-helper">
              {formData.bio.length}/120 characters
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Profile...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
