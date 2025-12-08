import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmEmail } from '@/api/auth';
import './ConfirmEmail.css';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  // ref to ensure we only run once
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const userId = searchParams.get('userId') || '';
    const token = searchParams.get('token') || '';
    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    confirmEmail({ userId, token })
      .then(msg => {
        setStatus('success');
        setMessage(msg);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data || err.message);
      });
  }, [searchParams]);

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        {status === 'pending' && <p>Confirming your email…</p>}
        {status === 'success' && (
          <>
            <h2>Email Confirmed 🎉</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Oops!</h2>
            <p className="error">{message}</p>
            <button onClick={() => navigate('/')}>Back to Home</button>
          </>
        )}
      </div>
    </div>
  );
}
