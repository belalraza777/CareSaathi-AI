import { Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import "./AppFooter.css";

function AppFooter() {
    // Keep year automatic so the footer remains current without manual updates.
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="app-footer__inner">
                <section className="app-footer__brand-block" aria-label="Brand information">
                    <h2 className="app-footer__brand">
                        <FaHeartbeat />
                        CareSaathi AI
                    </h2>
                    <p className="app-footer__tagline">
                        Digital care experience for faster and more comfortable consultations.
                    </p>
                </section>

                <nav className="app-footer__nav" aria-label="Footer Navigation">
                    <Link to="/" className="app-footer__link">Home</Link>
                    <Link to="/consultation/new" className="app-footer__link">New Consultation</Link>
                    <Link to="/consultation/recent" className="app-footer__link">Recent Consultations</Link>
                    <Link to="/profile" className="app-footer__link">Profile</Link>
                </nav>
            </div>

            <div className="app-footer__bottom">
                <p>© {currentYear} CareSaathi AI</p>
                <p>Designed for clear, structured and compassionate guidance.</p>
            </div>
        </footer>
    );
}

export default AppFooter;
