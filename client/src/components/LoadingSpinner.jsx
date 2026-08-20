import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '4px solid rgba(99, 102, 241, 0.2)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>{text}</p>
    </div>
  );
};
