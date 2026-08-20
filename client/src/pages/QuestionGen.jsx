import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Sparkles, CheckCircle, AlertTriangle, PlayCircle, HelpCircle, ShieldAlert } from 'lucide-react';

export const QuestionGen = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/interviews/${sessionId}`);
        if (data.success) {
          setSession(data.session);
        }
      } catch (err) {
        setError(err.message || 'Failed to load question preview.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) return <LoadingSpinner text="Performing RAG skill analysis & loading tailored questions..." />;

  if (error || !session) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <ShieldAlert size={48} color="#f43f5e" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Session Error</h2>
        <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.5rem' }}>{error || 'Interview session not found.'}</p>
        <Link to="/resumes" className="btn btn-primary">Back to Resume Upload</Link>
      </div>
    );
  }

  const { skillAnalysis, questions, targetRole } = session;
  const matchScore = skillAnalysis?.matchScore || 75;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Skill Analysis Summary Header */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '999px', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Sparkles size={16} />
              <span>RAG-Lite Match Analysis</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{targetRole} Interview Setup</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Tailored questions generated based on skill overlaps and gaps.</p>
          </div>

          <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>ROLE MATCH SCORE</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: matchScore > 70 ? '#34d399' : '#fbbf24' }}>
              {matchScore}%
            </div>
          </div>
        </div>

        {/* Skill Breakdown Pills */}
        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={18} />
              <span>Overlapping Skills ({skillAnalysis?.overlappingSkills?.length || 0})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {skillAnalysis?.overlappingSkills?.length > 0 ? (
                skillAnalysis.overlappingSkills.map((s, idx) => (
                  <span key={idx} className="badge badge-success">{s}</span>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>General core software skills detected</span>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
              <AlertTriangle size={18} />
              <span>Identified Skill Gaps ({skillAnalysis?.missingSkills?.length || 0})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {skillAnalysis?.missingSkills?.length > 0 ? (
                skillAnalysis.missingSkills.map((s, idx) => (
                  <span key={idx} className="badge badge-warning">{s}</span>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No major skill gaps identified</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate(`/interview/play/${sessionId}`)} className="btn btn-primary">
            <PlayCircle size={20} />
            <span>Launch Live Streaming Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Questions Preview List */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
        Tailored Questions ({questions?.length || 0})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions?.map((q, idx) => (
          <div key={q.id || idx} className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-primary">Q{idx + 1}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8' }}>{q.category}</span>
              </div>
              <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                {q.difficulty}
              </span>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              {q.question}
            </h3>

            {q.rationale && (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'var(--bg-subtle)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Evaluation Goal: </span>
                {q.rationale}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
