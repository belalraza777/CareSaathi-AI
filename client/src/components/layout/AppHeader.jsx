import { useAuth } from "../../context/authContext";
import { NavLink } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import "./AppHeader.css";

function AppHeader() {
    const { user, isAuthenticated, handleLogout } = useAuth();

    return (
        <header className="app-header">
            <div className="app-header-left">
                <h1 className="app-brand">
                    <FaHeartbeat />
                    CareSaathi AI
                </h1>
                {/* Keep top navigation centralized in one shared header. */}
                <nav className="app-nav" aria-label="Main">
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Home</NavLink>
                            <NavLink to="/consultation/new" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>New Consultation</NavLink>
                            <NavLink to="/consultation/recent" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Recent Consultations</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Login</NavLink>
                            <NavLink to="/signup" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Sign Up</NavLink>
                        </>
                    )}
                </nav>
            </div>
            {isAuthenticated && (
                <div className="app-header-right">
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}> <FiUser />
                        {user?.name || user?.email}</NavLink>

                    <button type="button" onClick={handleLogout}>
                        <FiLogOut />
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}

export default AppHeader;
