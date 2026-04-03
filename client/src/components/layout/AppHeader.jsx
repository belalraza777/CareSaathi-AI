import { useAuth } from "../../context/authContext";
import { NavLink } from "react-router-dom";

function AppHeader() {
    const { user, isAuthenticated, handleLogout } = useAuth();

    return (
        <header className="app-header">
            <div className="app-header-left">
                <h1 className="app-brand">CareSaathi AI</h1>
                {/* Keep top navigation centralized in one shared header. */}
                <nav className="app-nav" aria-label="Main">
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Home</NavLink>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Profile</NavLink>
                            <NavLink to="/consultation" className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Consultation</NavLink>
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
                    <p className="app-user">{user?.name || user?.email}</p>
                    <button type="button" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </header>
    );
}

export default AppHeader;
