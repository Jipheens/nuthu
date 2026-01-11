import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <div className="container app-header-inner">
                <Link to="/" className="branding">Nuthu Archive</Link>
                <nav className="main-nav">
                    <ul className="nav-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/designers">Designers</Link></li>
                        <li><Link to="/rental">Rental</Link></li>
                        <li><Link to="/appointment">Book By Appointment</Link></li>
                    </ul>
                </nav>
                <Link to="/cart" className="cart-link">Cart</Link>
            </div>
        </header>
    );
};

export default Header;