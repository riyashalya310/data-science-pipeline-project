import React from 'react';
import { withRouter } from 'react-router-dom';
import './index.css';
import cdacImg from '../../images/cdac-img.jpg';

const Header = ({ onLogout, location,startTour }) => {
    // Check if the current path is not the home page
    const isHomePage = location.pathname === '/';

    return (
        <header className="header">
            <div className="header-logo-container">
                <img src={cdacImg} alt='Brand Logo' className="header-logo" style={{ width: "60px" }} />
            </div>
            <nav className="header-nav-buttons">
                <button onClick={startTour}>Start Tour</button>
                {/* Conditionally render the Home button */}
                { !isHomePage && <a href="/" className="header-nav-button">Home</a> }
                <button className="header-nav-button header-logout-button" onClick={onLogout}>Logout</button>
            </nav>
        </header>
    );
};

export default withRouter(Header);
