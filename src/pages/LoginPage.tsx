import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            showToast('Welcome back!', 'success');
            navigate(from, { replace: true });
        } catch (error: any) {
            showToast(
                error.response?.data?.error || 'Login failed. Please check your credentials.',
                'error'
            );
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
                        Welcome back to Nuthu Archive
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
