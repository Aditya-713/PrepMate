import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PlayCircle, FileText, CheckCircle2, Trophy, Clock, ArrowRight, Trash2, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sessionRes, resumeRes] = await Promise.all([
          apiRequest('/interviews'),
          apiRequest('/resumes'),
        ]);

        if (sessionRes.success) setSessions(sessionRes.sessions);
        if (resumeRes.success) setResumes(resumeRes.resumes);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteSession = async (sessionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview session?')) return;

    try {
      await apiRequest(`/interviews/${sessionId}`, { method: 'DELETE' });
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (err) {
      alert(err.message || 'Could not delete session.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading candidate dashboard..." />;

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const avgScore = completedSessions.length > 0
    ? (completedSessions.reduce((acc, s) => acc + (s.evaluation?.score || 0), 0) / completedSessions.length).toFixed(1)
    : 'N/A';

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '999px', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
            <span>AI Prep Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Master Your Next Technical Interview</h1>
          <p style={{ color: '#94a3b8', maxWidth: '650px', fontSize: '1rem' }}>
            Upload your resume, paste job descriptions, receive RAG skill-gap insights, and practice streaming mock interviews with tailored AI feedback.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/interview/new" className="btn btn-primary">
              <PlayCircle size={20} />
              <span>Start Mock Interview</span>
            </Link>
            <Link to="/resumes" className="btn btn-secondary">
              <FileText size={20} />
              <span>Manage Resumes ({resumes.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', color: '#818cf8' }}>
            <PlayCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Total Interviews</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{sessions.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '16px', color: '#34d399' }}>
            <Trophy size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Average Performance Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
              {avgScore} {avgScore !== 'N/A' && <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ 10</span>}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '16px', color: '#c084fc' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Uploaded Resumes</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{resumes.length}</div>
          </div>
        </div>
      </div>

      {/* Past Sessions List */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>Interview History</h2>
      </div>

      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Clock size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>No Interview Sessions Yet</h3>
          <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0.5rem auto 1.5rem', fontSize: '0.95rem' }}>
            Create your first mock interview session by providing a target job description and resume.
          </p>
          <Link to="/interview/new" className="btn btn-primary">
            <PlayCircle size={18} />
            <span>Launch First Session</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((sess) => {
            const isCompleted = sess.status === 'completed';
            const score = sess.evaluation?.score;

            return (
              <div
                key={sess._id}
                className="card"
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      color: isCompleted ? '#34d399' : '#fbbf24',
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{sess.targetRole}</h3>
                      <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
                        {sess.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <span>Date: {new Date(sess.createdAt).toLocaleDateString()}</span>
                      <span>Questions: {sess.questions?.length || 0}</span>
                      {sess.tokenUsage?.totalTokens > 0 && <span>Tokens: {sess.tokenUsage.totalTokens}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {score !== undefined && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>OVERALL SCORE</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                        {score} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 10</span>
                      </div>
                    </div>
                  )}

                  <Link to={isCompleted ? `/interview/session/${sess._id}` : `/interview/play/${sess._id}`} className="btn btn-secondary btn-sm">
                    <span>{isCompleted ? 'View Report' : 'Continue Interview'}</span>
                    <ArrowRight size={16} />
                  </Link>

                  <button onClick={(e) => handleDeleteSession(sess._id, e)} className="btn btn-danger btn-sm" title="Delete session">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
