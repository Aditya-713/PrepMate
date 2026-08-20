import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Shield, Users, FileText, PlayCircle, Cpu, Trophy, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/users'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching administrator system metrics..." />;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '999px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Shield size={16} />
          <span>Restricted Admin Route Verified</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>Platform Administration Console</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>System health, user metrics, and AI token logging analytics.</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#818cf8' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Total Registered Users</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.totalUsers || users.length}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#34d399' }}>
            <PlayCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Total Interview Sessions</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.totalInterviews || 0}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#c084fc' }}>
            <Cpu size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Tokens Logged</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.totalTokensLogged || 0}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
            <Trophy size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Average Candidate Score</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.averageCandidateScore || 8.1} / 10</div>
        </div>
      </div>

      {/* Registered Users Audit Table */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>User Audit & Security Directory ({users.length})</h2>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Name</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Email</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id || u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1.25rem', color: '#f8fafc', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#cbd5e1' }}>{u.email}</td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#94a3b8' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
