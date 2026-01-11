import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email subscription
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <footer className="app-footer">
            <div className="container">
                <div className="footer-content">
                    {/* Email Subscription */}
                    <div className="footer-section">
                        <h3 className="footer-title">Subscribe to our emails</h3>
                        <form onSubmit={handleSubscribe} className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-input"
                                required
                            />
                            <button type="submit" className="newsletter-button">→</button>
                        </form>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <div className="footer-column">
                            <Link to="/">Home</Link>
                            <Link to="/shop">Shop</Link>
                            <Link to="/designers">Designers</Link>
                        </div>
                        <div className="footer-column">
                            <Link to="/rental">Rental</Link>
                            <Link to="/appointment">Book By Appointment</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-notice">All Sales are final</p>
                    <p className="footer-copyright">&copy; {new Date().getFullYear()}, Nuthu Archive</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;