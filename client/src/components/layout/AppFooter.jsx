import { Link } from "react-router-dom";
import { FaHeartbeat, FaStethoscope, FaHistory, FaUser, FaHome } from "react-icons/fa";
import "./AppFooter.css";

function AppFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="app-footer__container">
                <div className="app-footer__main">
                    {/* Brand Section */}
                    <div className="app-footer__brand">
                        <h2 className="app-footer__logo">
                            <FaHeartbeat className="logo-icon" />
                            CareSaathi AI
                        </h2>
                        <p className="app-footer__description">
                            Digital care experience for faster and more comfortable consultations.
                        </p>
                    </div>

                    {/* Navigation Links with Icons */}
                    <nav className="app-footer__nav" aria-label="Footer Navigation">
                        <Link to="/" className="app-footer__link">
                            <FaHome /> Home
                        </Link>
                        <Link to="/consultation/new" className="app-footer__link">
                            <FaStethoscope /> New Consultation
                        </Link>
                        <Link to="/consultation/recent" className="app-footer__link">
                            <FaHistory /> Recent Consultations
                        </Link>
                        <Link to="/profile" className="app-footer__link">
                            <FaUser /> Profile
                        </Link>
                    </nav>
                </div>

                <div className="app-footer__bottom">
                    <p>© {currentYear} CareSaathi AI – All conversations are private & secure</p>
                    {/* Author credit kept intentionally subtle in footer bottom row. */}
                    <p className="app-footer__credit">Made by BELAL</p>
                </div>
            </div>
        </footer>
    );
}

export default AppFooter;