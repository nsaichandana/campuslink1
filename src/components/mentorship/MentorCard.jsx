import React, { useState } from 'react';
import { sendMentorRequest } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';
import './MentorCard.css';

export default function MentorCard({ mentor }) {
  const { user } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendMentorRequest(user.uid, mentor.userId, message);
      setSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mentor-card card card-interactive">
        <div className="mentor-card-header">
          <div className="mentor-avatar">
            {mentor.department?.charAt(0) || 'M'}
          </div>
          <div className="mentor-info">
            <div className="mentor-meta">
              {mentor.department} • {mentor.year}
            </div>
            <div className="mentor-match">
              <span className="match-score">{mentor.matchScore}% match</span>
            </div>
          </div>
        </div>

        <div className="mentor-card-body">
          <div className="mentor-skills">
            {(mentor.skillsHave || mentor.skillsOffered)?.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="tag tag-primary">{skill}</span>
            ))}
            {(mentor.skillsHave || mentor.skillsOffered)?.length > 3 && (
              <span className="tag">+{(mentor.skillsHave || mentor.skillsOffered).length - 3}</span>
            )}
          </div>

          <p className="mentor-bio">{mentor.bio}</p>

          <div className="mentor-reason">
            <strong>Why this match?</strong>
            <p>{mentor.matchReason}</p>
          </div>
        </div>

        <div className="mentor-card-footer">
          <button 
            className="btn btn-primary btn-block"
            onClick={() => setShowRequestModal(true)}
          >
            Send Request
          </button>
        </div>
      </div>

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Request Sent!</h3>
                <p>You'll be notified when they respond.</p>
              </div>
            ) : (
              <>
                <h3>Send Mentor Request</h3>
                <p className="text-muted mb-lg">
                  Introduce yourself and explain what you'd like to learn
                </p>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendRequest}>
                  <div className="form-group">
                    <label className="form-label">Message (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Hi! I'd love to learn about..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRequestModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ flex: 1 }}
                    >
                      {loading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
