import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ConnectionTest() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('checking');
      setError('');
      const { data } = await api.get('/health', { timeout: 5000 });
      console.log('Backend health check:', data);
      setStatus('connected');
    } catch (err) {
      console.error('Backend connection error:', err);
      setError(err?.message || 'Connection failed');
      setStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      padding: '8px 12px', 
      borderRadius: '6px', 
      backgroundColor: getStatusColor(), 
      color: 'white', 
      fontSize: '12px',
      zIndex: 1000
    }}>
      Backend: {status === 'checking' ? 'Checking...' : status === 'connected' ? 'Connected' : 'Disconnected'}
      {error && <div style={{ fontSize: '10px', marginTop: 2 }}>{error}</div>}
    </div>
  );
}