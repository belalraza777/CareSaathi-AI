import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHomeStore } from "../../stores/homeStore";

function Home() {
    const consultations = useHomeStore((state) => state.consultations);
    const loadingConsultations = useHomeStore((state) => state.loadingConsultations);
    const error = useHomeStore((state) => state.error);
    const loadConsultations = useHomeStore((state) => state.loadConsultations);

    // Load dashboard consultations through the shared Zustand store.
    useEffect(() => {
        loadConsultations();
    }, [loadConsultations]);

    // Memoize consultation list items so unrelated state changes do not rebuild each row.
    const consultationListItems = useMemo(() => consultations.map((consultation) => (
        <li key={consultation.consultationId} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <strong>Symptoms:</strong> {consultation.mainSymptom.join(", ") || "N/A"} <br />
            <strong>Duration:</strong> {consultation.symptomDuration || "N/A"} <br />
            <strong>Risk Level:</strong> {consultation.riskLevel || "Unknown"} <br />
            <strong>Date:</strong> {new Date(consultation.createdAt).toLocaleDateString()} <br />
            <Link to={`/consultation/chat/${consultation.consultationId}`}>View Chat</Link>
        </li>
    )), [consultations]);

    return (
        <main>
            <h2>Your Health Dashboard</h2>
            <p>Manage your medical information and health records in one place.</p>

            <div>
                <h3>My Profile</h3>
                <p>View and manage your personal health information.</p>
                <Link to="/profile">Go to Profile</Link>
            </div>

            <div>
                {/* Keeps consultation access visible from dashboard actions. */}
                <h3>Consultation</h3>
                <p>Start a consultation and chat with the AI doctor.</p>
                <Link to="/consultation/new">Start Consultation</Link>
            </div>

            <div>
                <h3> My Consultations</h3>
                <p>View your past consultations and chat history.</p>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {loadingConsultations ? (
                    <p>Loading consultations...</p>
                ) : consultations.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {consultationListItems}
                    </ul>
                ) : (
                    <p>No consultations yet. <Link to="/consultation/new">Start one now</Link></p>
                )}
            </div>

        </main>
    );
}

export default Home;
