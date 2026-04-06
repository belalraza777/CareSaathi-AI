import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import "./AppHeader.css";

function AppHeader() {
    const { user, isAuthenticated, handleLogout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Auto-close menu after navigation or auth change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, isAuthenticated]);

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    const handleLogoutAndClose = () => {
        closeMenu();
        handleLogout();
    };

    return (
        <header className="app-header">
            <div className="app-header-container">
                <div className="app-header-left">
                    <div className="app-brand-row">
                        {/* Brand doubles as a quick Home link. */}
                        <Link to="/" className="app-brand" onClick={closeMenu} aria-label="Go to Home">
                            <FaHeartbeat />
                            <span>CareSaathi AI</span>
                        </Link>
                        <button
                            type="button"
                            className="app-header-toggle"
                            aria-expanded={isMenuOpen}
                            aria-controls="app-main-nav"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <FiX /> : <FiMenu />}
                            <span>{isMenuOpen ? "Close" : "Menu"}</span>
                        </button>
                    </div>

                    <nav id="app-main-nav" className={`app-nav ${isMenuOpen ? "is-open" : ""}`} aria-label="Main">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>Home</NavLink>
                                <NavLink to="/consultation/new" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>New Consultation</NavLink>
                                <NavLink to="/consultation/recent" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>Recent Consultations</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>Login</NavLink>
                                <NavLink to="/signup" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>Sign Up</NavLink>
                            </>
                        )}
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className={`app-header-right ${isMenuOpen ? "is-open" : ""}`}>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}>
                            <FiUser />
                            {user?.name || user?.email}
                        </NavLink>
                        <button type="button" onClick={handleLogoutAndClose} className="logout-btn">
                            <FiLogOut />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default AppHeader;