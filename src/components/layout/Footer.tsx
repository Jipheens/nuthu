import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="container app-footer-inner">
                <p>&copy; {new Date().getFullYear()} Outfit Studio. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;