import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { NavLink, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import "./AppHeader.css";

function AppHeader() {
    const { user, isAuthenticated, handleLogout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Auto-close menu after navigation so mobile users land on content immediately.
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, isAuthenticated]);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleLogoutAndClose = () => {
        closeMenu();
        handleLogout();
    };

    return (
        <header className="app-header">
            <div className="app-header-left">
                <div className="app-brand-row">
                    <h1 className="app-brand">
                        <FaHeartbeat />
                        CareSaathi AI
                    </h1>
                    <button
                        type="button"
                        className="app-header-toggle"
                        aria-expanded={isMenuOpen}
                        aria-controls="app-main-nav"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        onClick={handleToggleMenu}
                    >
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                        <span>{isMenuOpen ? "Close" : "Menu"}</span>
                    </button>
                </div>
                {/* Keep top navigation centralized in one shared header. */}
                <nav id="app-main-nav" className={isMenuOpen ? "app-nav is-open" : "app-nav"} aria-label="Main">
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
                <div className={isMenuOpen ? "app-header-right is-open" : "app-header-right"}>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"} onClick={closeMenu}> <FiUser />
                        {user?.name || user?.email}</NavLink>

                    <button type="button" onClick={handleLogoutAndClose}>
                        <FiLogOut />
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}

export default AppHeader;
