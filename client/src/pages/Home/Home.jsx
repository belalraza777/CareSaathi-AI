import { useAuth } from "../../context/authContext";
import { Link } from "react-router-dom";

function Home() {
    const { user, handleLogout } = useAuth();

    return (
        <div>
            <header>
                <h1>AI Doctor</h1>
                <p>Welcome, {user?.name || user?.email}</p>
                <Link to="/profile">View Profile</Link>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <main>
                <h2>Your Health Dashboard</h2>
                <p>Manage your medical information and health records in one place.</p>

                    <div>
                        <h3>📋 My Profile</h3>
                        <p>View and manage your personal health information.</p>
                        <Link to="/profile">Go to Profile</Link>
                    </div>

            </main>
        </div>
    );
}

export default Home;
