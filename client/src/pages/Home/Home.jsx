import { Link } from "react-router-dom";
import "./Home.css";
import { FaHeartbeat, FaStethoscope } from "react-icons/fa";

function Home() {
    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="home-hero-inner">
                    <div className="home-hero-copy">
                        <div className="home-hero-kicker">
                            <span className="home-hero-live" aria-hidden="true" />
                            AI doctor experience
                        </div>

                        <h2 className="home-hero-title">
                            Talk to an AI doctor.
                            <br />
                            Get guidance you can continue.
                        </h2>

                        <p className="home-hero-subtitle">
                            CareSaathi AI helps you describe symptoms in seconds,
                            then keeps a clean chat history for follow-ups.
                        </p>

                        <div className="home-cta-row">
                            <Link to="/consultation/new" className="home-btn home-btn--primary">
                                <FaStethoscope />
                                Start consultation
                            </Link>
                            <Link to="/profile" className="home-btn home-btn--secondary">
                                My profile
                            </Link>
                        </div>

                        <div className="home-badges" role="list" aria-label="Highlights">
                            <div className="home-badge" role="listitem">
                                <FaHeartbeat />
                                Doctor-style responses
                            </div>
                            <div className="home-badge" role="listitem">
                                <FaStethoscope />
                                Voice transcript + chat
                            </div>
                            <div className="home-badge" role="listitem">
                                <span className="home-badge-dot" aria-hidden="true" />
                                Simple, calm UX
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
                                    <FaStethoscope />
                                </div>
                                <div className="home-preview-line home-preview-line--short" />
                                <div className="home-preview-line home-preview-line--mid" />
                                <div className="home-preview-line home-preview-line--long" />
                            </div>
                            <div className="home-preview-footer">
                                <div className="home-preview-pulse" />
                                <div className="home-preview-footer-text">Doctor is ready</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-feature-section">
                <h3 className="home-section-title">Everything built around patient comfort</h3>
                <div className="home-feature-grid">
                    <div className="home-feature-card">
                        <div className="home-feature-icon">
                            <FaStethoscope />
                        </div>
                        <h4>Quick symptom intake</h4>
                        <p>
                            Start talking. We capture your transcript and show it immediately,
                            so you always stay in control.
                        </p>
                    </div>

                    <div className="home-feature-card">
                        <div className="home-feature-icon home-feature-icon--secondary">
                            <FaHeartbeat />
                        </div>
                        <h4>Clear doctor follow-up</h4>
                        <p>
                            The AI doctor responds in a calm, structured chat designed for
                            fast comprehension and next steps.
                        </p>
                    </div>

                    <div className="home-feature-card">
                        <div className="home-feature-icon home-feature-icon--accent">
                            <FaStethoscope />
                        </div>
                        <h4>Consultation history</h4>
                        <p>
                            Your past consultations stay accessible, so follow-ups feel like
                            one continuous journey.
                        </p>
                    </div>
                </div>
            </section>

            <section className="home-dashboard-grid">
                <div className="home-section home-dashboard-card">
                    <h3>My Profile</h3>
                    <p>Keep your health details up to date for smarter consultations.</p>
                    <div className="home-quick-actions">
                        <Link to="/profile" className="home-btn home-btn--link">
                            Go to Profile
                        </Link>
                    </div>
                </div>

                <div className="home-section home-dashboard-card">
                    <h3>Recent Consultations</h3>
                    <p>Review all your consultations on a dedicated page and continue any chat.</p>

                    <div className="home-quick-actions">
                        <Link to="/consultation/recent" className="home-btn home-btn--link">
                            View recent consultations
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
