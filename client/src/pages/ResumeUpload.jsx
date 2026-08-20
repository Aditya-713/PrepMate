import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { FileUp, FileText, CheckCircle, ArrowRight, AlertCircle, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const data = await apiRequest('/resumes');
      if (data.success) {
        setResumes(data.resumes);
        if (data.resumes.length > 0) {
          setSelectedResumeId(data.resumes[0]._id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch resumes:', err.message);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const data = await apiRequest('/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (data.success) {
        setResumes([data.resume, ...resumes]);
        setSelectedResumeId(data.resume._id);
        setFile(null);
      }
    } catch (err) {
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartGeneration = async (e) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please provide a job description of at least 20 characters.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const data = await apiRequest('/interviews/generate-questions', {
        method: 'POST',
        body: {
          resumeId: selectedResumeId || null,
          jobDescription,
          targetRole,
        },
      });

      if (data.success) {
        navigate(`/interview/questions/${data.session._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    try {
      await apiRequest(`/resumes/${id}`, { method: 'DELETE' });
      const updated = resumes.filter((r) => r._id !== id);
      setResumes(updated);
      if (selectedResumeId === id) {
        setSelectedResumeId(updated[0]?._id || '');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>Intake Resume & Job Description</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Upload your resume PDF and paste the target job description to trigger RAG skill-gap analysis.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Resume Section */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileUp size={20} color="#818cf8" />
            <span>1. Upload PDF Resume</span>
          </h2>

          <form onSubmit={handleFileUpload} style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                textAlign: 'center',
                background: 'var(--bg-subtle)',
                marginBottom: '1rem',
              }}
            >
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                id="file-input"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                <FileText size={36} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                  {file ? file.name : 'Click to select PDF or text document'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Max file size: 10MB</div>
              </label>
            </div>

            <button type="submit" disabled={!file || uploading} className="btn btn-secondary" style={{ width: '100%' }}>
              <span>{uploading ? 'Processing File...' : 'Upload Selected Resume'}</span>
            </button>
          </form>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.75rem' }}>Saved Resumes</h3>
          {loadingResumes ? (
            <LoadingSpinner text="Fetching resumes..." />
          ) : resumes.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No resumes uploaded yet. Upload one above or proceed with paste text.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {resumes.map((r) => (
                <div
                  key={r._id}
                  onClick={() => setSelectedResumeId(r._id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: selectedResumeId === r._id ? 'var(--primary-light)' : 'var(--bg-subtle)',
                    border: `1px solid ${selectedResumeId === r._id ? '#6366f1' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color={selectedResumeId === r._id ? '#818cf8' : '#64748b'} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{r.originalName || r.filename}</span>
                  </div>

                  <button onClick={(e) => handleDeleteResume(r._id, e)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Description Section */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#818cf8" />
            <span>2. Job Description & Role</span>
          </h2>

          <form onSubmit={handleStartGeneration}>
            <div className="form-group">
              <label className="form-label">Target Role Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer, Backend Specialist"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description Text</label>
              <textarea
                rows={10}
                required
                className="form-textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description text here (requirements, responsibilities, tech stack)..."
              />
            </div>

            <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <span>{uploading ? 'Analyzing Skills...' : 'Analyze Skills & Generate Questions'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
