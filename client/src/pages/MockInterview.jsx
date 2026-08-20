import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest, apiStreamPost } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Send, Bot, User, CheckCircle2, Mic, AlertCircle, Award } from 'lucide-react';

export const MockInterview = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [answerInput, setAnswerInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [transcript, streamBuffer]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/interviews/${sessionId}`);
      if (data.success) {
        setSession(data.session);
        setTranscript(data.session.transcript || []);
      }
    } catch (err) {
      setError(err.message || 'Could not load interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || streaming) return;

    const userText = answerInput.trim();
    setAnswerInput('');
    setError('');

    // Append user answer locally immediately
    const updatedTranscript = [
      ...transcript,
      { sender: 'user', content: userText, timestamp: new Date() },
    ];
    setTranscript(updatedTranscript);
    setStreaming(true);
    setStreamBuffer('');

    let currentStreamText = '';

    await apiStreamPost(
      `/interviews/${sessionId}/answer-stream`,
      { answer: userText },
      (chunk) => {
        currentStreamText += chunk;
        setStreamBuffer(currentStreamText);
      },
      (err) => {
        setError(err || 'Streaming error occurred.');
      }
    );

    // Commit streamed response to transcript array
    setTranscript([
      ...updatedTranscript,
      { sender: 'ai', content: currentStreamText || 'Thank you for your answer.', timestamp: new Date() },
    ]);
    setStreamBuffer('');
    setStreaming(false);

    // Refresh session state index
    fetchSessionSilent();
  };

  const fetchSessionSilent = async () => {
    try {
      const data = await apiRequest(`/interviews/${sessionId}`);
      if (data.success) {
        setSession(data.session);
      }
    } catch (err) {
      // Ignore background refresh errors
    }
  };

  const handleFinishInterview = async () => {
    if (!window.confirm('Ready to complete this interview and generate your AI performance evaluation?')) return;

    try {
      setCompleting(true);
      const data = await apiRequest(`/interviews/${sessionId}/complete`, { method: 'POST' });
      if (data.success) {
        navigate(`/interview/session/${sessionId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate evaluation report.');
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to AI Mock Interviewer SSE Stream..." />;

  if (completing) return <LoadingSpinner text="Analyzing interview transcript & generating evaluation report..." />;

  const questions = session?.questions || [];
  const currentIdx = session?.currentQuestionIndex || 0;
  const progressPercent = Math.min(100, Math.round(((currentIdx + 1) / (questions.length || 1)) * 100));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Session Progress Header */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{session?.targetRole} Mock Interview</h1>
            <span className="badge badge-primary">Live Session</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Turn {Math.min(currentIdx + 1, questions.length)} of {questions.length} questions
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '160px', background: 'var(--bg-subtle)', borderRadius: '999px', height: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.4s ease' }} />
          </div>

          <button onClick={handleFinishInterview} className="btn btn-secondary btn-sm" style={{ borderColor: '#10b981', color: '#34d399' }}>
            <Award size={16} />
            <span>Finish & Evaluate</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Streaming Chat Container */}
      <div className="chat-container">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%' }}>
              <Bot size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>PrepMate AI Interviewer</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                <span>SSE Token Stream Active</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <Mic size={16} color="#818cf8" />
            <span>Audio Transcript Mode</span>
          </div>
        </div>

        <div className="chat-messages">
          {transcript.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.sender}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: msg.sender === 'user' ? '#e0e7ff' : '#94a3b8', marginBottom: '0.35rem', fontWeight: 700 }}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                <span>{msg.sender === 'user' ? 'Candidate (You)' : 'AI Interviewer'}</span>
              </div>
              <div>{msg.content}</div>
            </div>
          ))}

          {/* Render live streaming tokens */}
          {streaming && (
            <div className="message-bubble ai">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 700 }}>
                <Bot size={14} />
                <span>AI Interviewer (Streaming...)</span>
              </div>
              <div>
                {streamBuffer}
                <span className="cursor-blink" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendAnswer} className="chat-input-box">
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            placeholder={streaming ? 'AI is generating follow-up...' : 'Type your answer to the interviewer question...'}
            disabled={streaming}
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
          />

          <button type="submit" disabled={!answerInput.trim() || streaming} className="btn btn-primary">
            <Send size={18} />
            <span>Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
};
