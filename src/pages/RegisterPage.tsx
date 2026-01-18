import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendVerificationEmail } from '../services/api';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, name);
            showToast('Account created successfully!', 'success');

            // Send verification code (for checkout email confirmation)
            try {
                const res = await sendVerificationEmail(email);
                if ((res as any)?.previewUrl) {
                    showToast('Verification email preview available (dev).', 'success');
                } else {
                    showToast('Verification code sent to your email.', 'success');
                }
            } catch {
                // Don't block account creation if email sending fails
                showToast('Could not send verification code yet. You can resend it during checkout.', 'error');
            }

            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            showToast(
                error.response?.data?.error || 'Registration failed. Please try again.',
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
                    <h1 className="section-title">Create Account</h1>
                    <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Join Nuthu Archive
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Name (optional)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                autoComplete="name"
                            />
                        </div>

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
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="add-to-cart-button"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem' }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#999', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#fff', textDecoration: 'underline' }}>
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default RegisterPage;
