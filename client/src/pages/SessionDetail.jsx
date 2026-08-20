import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Trophy, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, ArrowLeft, Cpu } from 'lucide-react';

export const SessionDetail = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessionDetail = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/interviews/${sessionId}`);
        if (data.success) {
          setSession(data.session);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch session detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [sessionId]);

  if (loading) return <LoadingSpinner text="Fetching full session report & AI evaluation metrics..." />;

  if (error || !session) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Session Not Found</h2>
        <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.5rem' }}>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const { targetRole, evaluation, transcript, tokenUsage, createdAt } = session;
  const score = evaluation?.score || 8.0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Candidate Dashboard</span>
        </Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>{targetRole} Evaluation Report</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completed on {new Date(createdAt).toLocaleDateString()}</p>
      </div>

      {/* Score Overview Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Trophy size={20} />
              <span>Overall Candidate Performance</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>AI Interviewer Feedback Summary</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {evaluation?.feedback || 'Good structural answers provided. Demonstrates technical proficiency and clear verbal explanation.'}
            </p>
          </div>

          <div style={{ textAlign: 'center', background: 'var(--bg-subtle)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', minWidth: '180px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>PERFORMANCE SCORE</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#34d399', lineHeight: '1.1', margin: '0.25rem 0' }}>
              {score}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>OUT OF 10.0</div>
          </div>
        </div>

        {/* Token Usage Footer Log */}
        {tokenUsage && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={14} color="#818cf8" />
              <span>Logged Token Usage:</span>
            </span>
            <span>Prompt: {tokenUsage.promptTokens || 0}</span>
            <span>Completion: {tokenUsage.completionTokens || 0}</span>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>Total: {tokenUsage.totalTokens || 0} tokens</span>
          </div>
        )}
      </div>

      {/* Strengths & Gaps Breakdown */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} />
            <span>Key Candidate Strengths</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(evaluation?.strengths || ['Clear communication', 'Solid technical depth']).map((str, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span>Areas for Improvement</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(evaluation?.gaps || ['Incorporate more quantitative metrics']).map((gap, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>!</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {evaluation?.recommendations?.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={20} />
            <span>Targeted Recommendations</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {evaluation.recommendations.map((rec, idx) => (
              <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: '#cbd5e1', border: '1px solid var(--border-color)' }}>
                👉 {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Transcript Log */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={20} color="#818cf8" />
        <span>Complete Interview Transcript ({transcript?.length || 0} messages)</span>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {transcript?.map((item, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.25rem',
              borderLeft: item.sender === 'user' ? '4px solid #6366f1' : '4px solid #10b981',
              background: item.sender === 'user' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span style={{ fontWeight: 700, color: item.sender === 'user' ? '#818cf8' : '#34d399' }}>
                {item.sender === 'user' ? 'CANDIDATE ANSWER' : 'AI INTERVIEWER'}
              </span>
              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#f8fafc', whiteSpace: 'pre-wrap' }}>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
