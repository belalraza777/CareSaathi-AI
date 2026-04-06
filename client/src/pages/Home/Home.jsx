import { Link } from "react-router-dom";
import "./Home.css";
import { FaHeartbeat,FaHistory, FaStethoscope, FaMicrophone, FaShieldAlt, FaCommentMedical, FaArrowRight, FaRobot,FaUserCircle } from "react-icons/fa";

function Home() {
    return (
        <main className="home-page">
            {/* Hero Section – Modernised */}
            <section className="home-hero">
                <div className="home-hero-bg" aria-hidden="true"></div>
                <div className="home-hero-inner">
                    <div className="home-hero-copy">
                        <div className="home-hero-kicker">
                            <span className="home-hero-live" aria-hidden="true" />
                            AI doctor experience
                        </div>

                        <h1 className="home-hero-title">
                            Talk to an AI doctor.
                            <br />
                            <span className="gradient-text">Guidance you can continue.</span>
                        </h1>

                        <p className="home-hero-subtitle">
                            CareSaathi AI helps you describe symptoms in seconds,
                            then keeps a clean chat history for follow‑ups.
                        </p>

                        <div className="home-cta-row">
                            <Link to="/consultation/new" className="home-btn home-btn--primary">
                                <FaStethoscope />
                                Start consultation
                                <FaArrowRight className="btn-arrow" />
                            </Link>
                            <Link to="/profile" className="home-btn home-btn--secondary">
                                My profile
                            </Link>
                        </div>

                        <div className="home-badges" role="list" aria-label="Highlights">
                            <div className="home-badge" role="listitem">
                                <FaHeartbeat />
                                Doctor‑style responses
                            </div>
                            <div className="home-badge" role="listitem">
                                <FaMicrophone />
                                Voice transcript + chat
                            </div>
                            <div className="home-badge" role="listitem">
                                <FaShieldAlt />
                                Secure & private
                            </div>
                        </div>
                    </div>

                    <div className="home-hero-preview" aria-hidden="true">
                        <div className="home-preview-card">
                            <div className="home-preview-top">
                                <div className="home-preview-dot home-preview-dot--primary" />
                                <div className="home-preview-dot home-preview-dot--accent" />
                                <div className="home-preview-dot home-preview-dot--secondary" />
                            </div>
                            <div className="home-preview-body">
                                <div className="home-preview-avatar">
                                    <FaRobot />
                                </div>
                                <div className="home-preview-chat">
                                    <div className="chat-bubble bot">How can I help you today?</div>
                                    <div className="chat-bubble user">I have a headache and fatigue.</div>
                                    <div className="chat-bubble bot typing">●●●</div>
                                </div>
                            </div>
                            <div className="home-preview-footer">
                                <div className="home-preview-pulse" />
                                <div className="home-preview-footer-text">AI doctor – ready</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section – refined cards */}
            <section className="home-feature-section">
                <h2 className="home-section-title">Everything built around patient comfort</h2>
                <div className="home-feature-grid">
                    <div className="home-feature-card">
                        <div className="home-feature-icon">
                            <FaStethoscope />
                        </div>
                        <h3>Quick symptom intake</h3>
                        <p>
                            Start talking. We capture your transcript and show it immediately,
                            so you always stay in control.
                        </p>
                    </div>

                    <div className="home-feature-card">
                        <div className="home-feature-icon home-feature-icon--secondary">
                            <FaHeartbeat />
                        </div>
                        <h3>Clear doctor follow‑up</h3>
                        <p>
                            The AI doctor responds in a calm, structured chat designed for
                            fast comprehension and next steps.
                        </p>
                    </div>

                    <div className="home-feature-card">
                        <div className="home-feature-icon home-feature-icon--accent">
                            <FaCommentMedical />
                        </div>
                        <h3>Consultation history</h3>
                        <p>
                            Your past consultations stay accessible, so follow‑ups feel like
                            one continuous journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Dashboard – Profile + Recent links (no mock data) */}
            <section className="home-dashboard-grid">
                <div className="home-section home-dashboard-card">
                    <div className="card-header">
                        <FaUserCircle className="card-icon" />
                        <h3>My Profile</h3>
                    </div>
                    <p>Keep your health details up to date for smarter consultations.</p>
                    <div className="home-quick-actions">
                        <Link to="/profile" className="home-btn home-btn--link">
                            Go to Profile <FaArrowRight />
                        </Link>
                    </div>
                </div>

                <div className="home-section home-dashboard-card">
                    <div className="card-header">
                        <FaHistory className="card-icon" />
                        <h3>Recent Consultations</h3>
                    </div>
                    <p>Review all your consultations on a dedicated page and continue any chat.</p>
                    <div className="home-quick-actions">
                        <Link to="/consultation/recent" className="home-btn home-btn--link">
                            View recent consultations <FaArrowRight />
                        </Link>
                    </div>
                    <div className="home-quick-actions home-quick-actions--below">
                        <Link to="/consultation/new" className="home-btn home-btn--primary">
                            <FaStethoscope />
                            Start consultation
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;