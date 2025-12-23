import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createIssue } from '../../services/database';
import './IssueReport.css';

const CATEGORIES = ['Safety', 'Hygiene', 'Infrastructure', 'Canteen'];

export default function IssueReport() {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    isAnonymous: isAnonymous || false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.description.length > 300) {
        throw new Error('Description must be 300 characters or less');
      }

      await createIssue(
        {
          category: formData.category,
          description: formData.description,
          isAnonymous: formData.isAnonymous,
          userId: user?.uid
        },
        imageFile
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/activity');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="issue-report-screen">
        <div className="issue-report-container fade-in-up">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Issue Reported</h2>
            <p>Thank you for helping make our campus better. Your report has been submitted and will be reviewed by campus administrators.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-report-screen">
      <div className="issue-report-container fade-in-up">
        <div className="issue-report-header">
          <button 
            className="btn btn-text"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h2>Report a Campus Issue</h2>
          <p className="text-muted">
            Help us improve campus by reporting issues. All reports are reviewed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="issue-report-form">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-grid">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`category-btn ${formData.category === category ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, category }))}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (max 300 characters)</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the issue clearly and concisely..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={300}
              required
            />
            <p className="form-helper">
              {formData.description.length}/300 characters
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Image (Optional)</label>
            <div className="image-upload">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-upload-placeholder">
                    <span>📷</span>
                    <span>Add photo</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {!isAnonymous && user && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                />
                <span>Report anonymously</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || !formData.category}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
