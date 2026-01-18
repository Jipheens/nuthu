import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { sendVerificationEmail, verifyEmailCode } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const VERIFIED_EMAILS_KEY = 'verified_emails';

function getVerifiedEmails(): string[] {
  try {
    const raw = window.localStorage.getItem(VERIFIED_EMAILS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function setEmailVerified(email: string) {
  const normalized = email.trim().toLowerCase();
  const list = new Set(getVerifiedEmails());
  list.add(normalized);
  window.localStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(Array.from(list)));
}

function isEmailVerified(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getVerifiedEmails().includes(normalized);
}

const EmailVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const emailFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  }, [location.search]);

  const nextPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get('next') || '';
    // Only allow internal redirects.
    return next.startsWith('/') ? next : '/checkout';
  }, [location.search]);

  const [email, setEmail] = useState(user?.email || emailFromQuery);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Keep email in sync if user loads later.
    if (!email && user?.email) setEmail(user.email);
  }, [user, email]);

  useEffect(() => {
    if (email && isEmailVerified(email)) {
      showToast('Email already verified.', 'success');
    }
  }, []); // intentional: only on mount

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!/.+@.+\..+/.test(trimmed)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setSending(true);
      setPreviewUrl(null);
      const res = await sendVerificationEmail(trimmed);
      if (res?.previewUrl) setPreviewUrl(res.previewUrl);
      showToast('Verification code sent.', 'success');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to send verification code.';
      showToast(message, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    if (!trimmedEmail || !trimmedCode) {
      showToast('Email and code are required.', 'error');
      return;
    }

    try {
      setVerifying(true);
      const ok = await verifyEmailCode(trimmedEmail, trimmedCode);
      if (!ok) {
        showToast('Invalid or expired verification code.', 'error');
        return;
      }

      setEmailVerified(trimmedEmail);
      showToast('Email verified successfully.', 'success');
      navigate(nextPath);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="container page-content">
        <div className="auth-container" style={{ maxWidth: 520 }}>
          <h1 className="section-title">Verify email</h1>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            We’ll send a 6‑digit code to confirm your email.
          </p>

          <div className="auth-form" style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="button"
              className="add-to-cart-button"
              onClick={handleSend}
              disabled={sending}
              style={{ width: '100%', padding: '0.875rem' }}
            >
              {sending ? 'Sending...' : 'Send verification code'}
            </button>

            {previewUrl && (
              <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
                <p style={{ margin: 0, color: '#bbb', fontSize: '0.9rem' }}>
                  Email isn’t configured for Gmail yet. Preview your verification email here:
                </p>
                <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
                  Open preview
                </a>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Verification code</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>

            <button
              type="button"
              className="add-to-cart-button"
              onClick={handleVerify}
              disabled={verifying}
              style={{ width: '100%', padding: '0.875rem' }}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.25rem', color: '#999', fontSize: '0.875rem' }}>
              <Link to={nextPath} style={{ color: '#fff', textDecoration: 'underline' }}>
                Back
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmailVerificationPage;
