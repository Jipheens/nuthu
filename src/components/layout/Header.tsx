import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

const Header: React.FC = () => {
    console.log('Header rendering');
    const { totalItems } = useCart();
    const { user, logout } = useAuth();
    const { currency, setCurrency, currencies } = useCurrency();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showDesignerDropdown, setShowDesignerDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    
    console.log('Header state:', { totalItems, user, currency });

    const designers = [
        'Rick Owens',
        'Chrome Hearts',
        'Saint Laurent',
        'Dior Homme',
        'Gucci',
        'Undercover',
        'Number (N)ine',
        'Jean Paul Gaultier',
        'Kapital',
    ];

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Logged out successfully', 'success');
            navigate('/');
        } catch (error) {
            showToast('Logout failed', 'error');
        }
    };

    return (
        <header className="app-header">
            <div className="container app-header-inner">
                <Link to="/" className="branding">Nuthu Archive</Link>
                <nav className="main-nav">
                    <ul className="nav-links">
                        <li><Link to="/">🏠 Home</Link></li>
                        <li><Link to="/shop">🛍️ Shop</Link></li>
                        <li 
                            className="nav-dropdown"
                            onMouseEnter={() => setShowDesignerDropdown(true)}
                            onMouseLeave={() => setShowDesignerDropdown(false)}
                        >
                            <span className="nav-dropdown-trigger">✨ Designers</span>
                            {showDesignerDropdown && (
                                <div className="nav-dropdown-menu">
                                    <Link to="/designers" className="dropdown-item">See All</Link>
                                    {designers.map(designer => (
                                        <Link 
                                            key={designer} 
                                            to={`/shop?designer=${encodeURIComponent(designer)}`}
                                            className="dropdown-item"
                                        >
                                            {designer}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>
                        <li><Link to="/rental">👗 Rental</Link></li>
                        <li><Link to="/appointment">📅 Book By Appointment</Link></li>
                    </ul>
                </nav>
                <div className="header-actions">
                    <div 
                        className="currency-dropdown"
                        onMouseEnter={() => setShowCurrencyDropdown(true)}
                        onMouseLeave={() => setShowCurrencyDropdown(false)}
                    >
                        <span className="currency-trigger">{currency.name}</span>
                        {showCurrencyDropdown && (
                            <div className="currency-dropdown-menu">
                                {currencies.map(curr => (
                                    <button 
                                        key={curr.code}
                                        onClick={() => setCurrency(curr.code)}
                                        className={`dropdown-item ${curr.code === currency.code ? 'active' : ''}`}
                                    >
                                        {curr.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {user ? (
                        <div 
                            className="user-dropdown"
                            onMouseEnter={() => setShowUserDropdown(true)}
                            onMouseLeave={() => setShowUserDropdown(false)}
                        >
                            <span className="user-trigger">👤 {user.name || user.email}</span>
                            {showUserDropdown && (
                                <div className="user-dropdown-menu">
                                    <button onClick={handleLogout} className="dropdown-item">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-link">Login</Link>
                    )}
                    <Link to="/cart" className="cart-link">
                        🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;