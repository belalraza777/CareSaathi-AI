import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaStethoscope } from "react-icons/fa";
import { useHomeStore } from "../../stores/homeStore";
import "./RecentConsultation.css";

function RecentConsultation() {
  const consultations = useHomeStore((state) => state.consultations);
  const loadingConsultations = useHomeStore((state) => state.loadingConsultations);
  const error = useHomeStore((state) => state.error);
  const loadConsultations = useHomeStore((state) => state.loadConsultations);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  // Memoize list rows to avoid rebuilding cards on unrelated state updates.
  const consultationListItems = useMemo(() => consultations.map((consultation) => (
    <li key={consultation.consultationId} className="recent-consultation-card">
      <div className="recent-consultation-meta">
        <div className="recent-consultation-line">
          <span className="recent-consultation-label">Symptoms</span>
          <span className="recent-consultation-value">
            {consultation.mainSymptom?.join(", ") || "N/A"}
          </span>
        </div>
        <div className="recent-consultation-line">
          <span className="recent-consultation-label">Duration</span>
          <span className="recent-consultation-value">
            {consultation.symptomDuration || "N/A"}
          </span>
        </div>
        <div className="recent-consultation-line">
          <span className="recent-consultation-label">Risk</span>
          <span className="recent-consultation-value">
            {consultation.riskLevel || "Unknown"}
          </span>
        </div>
        <div className="recent-consultation-line">
          <span className="recent-consultation-label">Date</span>
          <span className="recent-consultation-value">
            {new Date(consultation.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="recent-consultation-actions">
        <Link className="recent-btn recent-btn--link" to={`/consultation/chat/${consultation.consultationId}`}>
          View Chat
        </Link>
      </div>
    </li>
  )), [consultations]);

  return (
    <main className="recent-page">
      <section className="recent-hero">
        <div>
          <h2 className="recent-title">Recent Consultations</h2>
          <p className="recent-subtitle">
            Revisit your consultation history and continue any conversation with your AI doctor.
          </p>
        </div>
        <div className="recent-hero-actions">
          <Link to="/consultation/new" className="recent-btn recent-btn--primary">
            <FaStethoscope />
            Start consultation
          </Link>
          <Link to="/" className="recent-btn recent-btn--link">
            Back to Home
          </Link>
        </div>
      </section>

      <section className="recent-list-card">
        <h3 className="recent-list-title">
          <FaClock />
          Consultation Timeline
        </h3>

        {error && <p className="recent-error">{error}</p>}

        {loadingConsultations ? (
          <p className="recent-muted">Loading consultations...</p>
        ) : consultations.length > 0 ? (
          <ul className="recent-consultations-list">{consultationListItems}</ul>
        ) : (
          <p className="recent-muted">
            No consultations yet. <Link to="/consultation/new" className="recent-link">Start one now</Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default RecentConsultation;
