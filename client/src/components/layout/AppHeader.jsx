import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { Link, NavLink } from "react-router-dom";
import {
    FiLogOut,
    FiMenu,
    FiUser,
    FiX,
    FiHome,
    FiClock,
    FiPlusCircle
} from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import "./AppHeader.css";

function AppHeader() {
    const { user, isAuthenticated, handleLogout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    const handleLogoutAndClose = () => {
        closeMenu();
        handleLogout();
    };

    return (
        <header className="app-header">
            <div className="app-header-container">

                {/* LEFT */}
                <div className="app-header-left">
                    <div className="app-brand-row">
                        <Link to="/" className="app-brand" onClick={closeMenu}>
                            <FaHeartbeat />
                            <span>CareSaathi AI</span>
                        </Link>

                        <button
                            className="app-header-toggle"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>

                    {/* NAV */}
                    <nav className={`app-nav ${isMenuOpen ? "is-open" : ""}`}>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/" className="app-nav-link" onClick={closeMenu}>
                                    <FiHome /> Home
                                </NavLink>

                                <NavLink to="/consultation/new" className="app-nav-link" onClick={closeMenu}>
                                    <FiPlusCircle /> New Consultation
                                </NavLink>

                                <NavLink to="/consultation/recent" className="app-nav-link" onClick={closeMenu}>
                                    <FiClock /> Recent
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="app-nav-link" onClick={closeMenu}>
                                    <FiUser /> Login
                                </NavLink>

                                <NavLink to="/signup" className="app-nav-link" onClick={closeMenu}>
                                    <FiUser /> Sign Up
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>

                {/* RIGHT */}
                {isAuthenticated && (
                    <div className={`app-header-right ${isMenuOpen ? "is-open" : ""}`}>
                        <NavLink to="/profile" className="app-nav-link" onClick={closeMenu}>
                            <FiUser />
                            {user?.name || user?.email}
                        </NavLink>

                        <button onClick={handleLogoutAndClose} className="logout-btn">
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