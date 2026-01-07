import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <div className="container app-header-inner">
                <div className="branding">OUTFIT STUDIO</div>
                <nav className="main-nav">
                    <ul className="nav-links">
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/designers">Designers</Link></li>
                        <li><Link to="/rental">Rental</Link></li>
                        <li><Link to="/appointment">Book By Appointment</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;