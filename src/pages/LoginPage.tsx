import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendVerificationEmail } from '../services/api';

const LoginPage: React.FC = () => {
    const location = useLocation();
    const emailFromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('email') || '';
    }, [location.search]);

    const [email, setEmail] = useState(emailFromQuery);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            showToast('Welcome back!', 'success');
            navigate(from, { replace: true });
        } catch (error: any) {
            const code = error?.response?.data?.code;
            const message =
                error?.response?.data?.error ||
                'Login failed. Please check your credentials.';

            if (code === 'EMAIL_NOT_VERIFIED') {
                try {
                    await sendVerificationEmail(email);
                } catch {
                    // ignore
                }
                showToast(message, 'error');
                navigate(`/verify-email?email=${encodeURIComponent(email)}&next=/login`);
                return;
            }

            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="app-shell">
            <section className="container page-content">
                <div className="auth-container">
                    <h1 className="section-title">Login</h1>
                    <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Welcome back to Archivesbybilly
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="add-to-cart-button"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem' }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#999', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#fff', textDecoration: 'underline' }}>
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default LoginPage;
