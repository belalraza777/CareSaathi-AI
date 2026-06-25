import { FaHeartbeat } from "react-icons/fa";
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
                    {/* Navigation removed – no links */}
                </div>

                <div className="app-footer__bottom">
                    <p>© {currentYear} CareSaathi AI – All conversations are private & secure</p>
                    <p className="app-footer__credit">Made by BELAL</p>
                </div>
            </div>
        </footer>
    );
}

export default AppFooter;