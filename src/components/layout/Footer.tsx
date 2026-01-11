import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const { currency, setCurrency, currencies } = useCurrency();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email subscription
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <footer className="app-footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Navigation */}
                    <div className="footer-nav-section">
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/shop" className="footer-link">Shop</Link>
                        <Link to="/designers" className="footer-link">Designers</Link>
                        <Link to="/rental" className="footer-link">Rental</Link>
                        <Link to="/appointment" className="footer-link">Book By Appointment</Link>
                    </div>

                    {/* Center - Notice */}
                    <div className="footer-center">
                        <p className="footer-notice">All Sales are final</p>
                    </div>

                    {/* Right - Brand */}
                    <div className="footer-brand">
                        <h2 className="footer-brand-name">Nuthu Archive</h2>
                    </div>
                </div>

                {/* Email Subscription */}
                <div className="footer-subscribe">
                    <h3 className="footer-subtitle">Subscribe to our emails</h3>
                    <form onSubmit={handleSubscribe} className="footer-newsletter">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="footer-email-input"
                            required
                        />
                        <button type="submit" className="footer-submit-btn" aria-label="Subscribe">→</button>
                    </form>
                </div>

                {/* Bottom Row */}
                <div className="footer-bottom">
                    <div className="footer-country">
                        <h4>Country/region</h4>
                        <select 
                            value={currency.code} 
                            onChange={(e) => setCurrency(e.target.value)}
                            className="footer-currency-select"
                        >
                            {currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="footer-payment">
                        <span className="payment-badge">Visa</span>
                        <span className="payment-badge">Mastercard</span>
                        <span className="payment-badge">Amex</span>
                        <span className="payment-badge">Google Pay</span>
                        <span className="payment-badge">PayPal</span>
                        <span className="payment-badge">Shop Pay</span>
                    </div>

                    <div className="footer-copyright">
                        <p>&copy; {new Date().getFullYear()}, Nuthu Archive</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;