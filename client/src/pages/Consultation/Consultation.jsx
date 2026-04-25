import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { useConsultationChatStore } from "../../stores/consultationChatStore";
import ConsultationChat from "./ConsultationChat";
import "./Consultation.css";
import VoiceChat from "./VoiceChat";

function Consultation() {
    // Read consultation id from URL and keep a safe fallback string.
    const { consultationId: routeConsultationId } = useParams();
    const activeConsultationId = routeConsultationId || "";

    // Pull chat state, consultation state, and actions from the shared store.
    const { chatMessage, messages, loadingChat, loadingHistory, error: chatError
        , setChatMessage, loadConsultationData, refreshConsultationData, consultationData, loadingConsultationData, loadMessageHistory, sendMessage, resetChatState
    } = useConsultationChatStore();


    useEffect(() => {
        // Keep chat state in sync with consultation id from the route.
        if (!routeConsultationId) {
            resetChatState();
            return;
        }
        loadConsultationData(routeConsultationId);
        loadMessageHistory(routeConsultationId);
    }, [routeConsultationId, loadConsultationData, loadMessageHistory, resetChatState]);

    // Trim chat message to prevent sending messages with only whitespace.
    const trimmedChatMessage = useMemo(() => chatMessage.trim(), [chatMessage]);

    // Send one message and then silently refresh consultation data for latest risk details.
    // useCallback keeps this handler stable for child components.
    const handleSendMessage = useCallback(async (e, messageOverride = "") => {
        // Accept both form submit events and direct programmatic calls (voice flow).
        e?.preventDefault?.();
        const safeMessage = (messageOverride || trimmedChatMessage).trim();
        const res = await sendMessage(activeConsultationId, safeMessage);
        if (!res.success) {
            return "";
        }

        // Refresh risk after each message.
        // This keeps the critical alert in sync.
        refreshConsultationData(activeConsultationId);
        return res?.assistantMessage || "";
        
    }, [activeConsultationId, trimmedChatMessage, sendMessage, refreshConsultationData]);

    // Derive display values from consultation risk for badge style and critical mode.
    const riskText = consultationData?.riskLevel || "n/a";
    const isCriticalRisk = String(consultationData?.riskLevel || "").toLowerCase() === "critical";
    const riskClassName = consultationData?.riskLevel === "Mild"
        ? "consultation-risk consultation-risk--mild"
        : consultationData?.riskLevel === "Moderate"
            ? "consultation-risk consultation-risk--moderate"
            : consultationData?.riskLevel === "Critical"
                ? "consultation-risk consultation-risk--critical"
                : "consultation-risk";

    // Freeze page scroll while emergency overlay is open.
    useEffect(() => {
        if (!isCriticalRisk) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isCriticalRisk]);

    return (
        <div className="consultation-page">
            {/* Critical mode overlay blocks interaction and shows immediate emergency guidance. */}
            {isCriticalRisk && (
                <div className="consultation-critical-overlay" role="alertdialog" aria-modal="true" aria-live="assertive">
                    <section className="consultation-critical-card">
                        <div className="consultation-critical-icon" aria-hidden="true">
                            <FiAlertTriangle />
                        </div>
                        <p className="consultation-critical-badge">Critical Emergency</p>
                        <h3>Immediate in-person care needed</h3>
                        <div className="consultation-critical-message-list">
                            <p>Call emergency services right now.</p>
                            <p>Go to the nearest emergency hospital immediately.</p>
                        </div>
                    </section>
                </div>
            )}

            {/* Consultation summary section shows latest clinical metadata for context. */}
            <h2>Consultation</h2>
            <section className="consultation-card">
                <h3>Details</h3>
                {loadingConsultationData ? (
                    <p>Loading consultation details...</p>
                ) : (
                    <div className="consultation-detail-grid">
                        <p><strong>ID:</strong> {consultationData?.consultationId || activeConsultationId || "n/a"}</p>
                        <p><strong>Symptoms:</strong> {consultationData?.mainSymptom?.length ? consultationData.mainSymptom.join(", ") : "n/a"}</p>
                        <p><strong>Duration:</strong> {consultationData?.symptomDuration || "n/a"}</p>
                        <p><strong>Notes:</strong> {consultationData?.notes?.trim() ? consultationData.notes : "n/a"}</p>
                        <p><strong>Gender:</strong> {consultationData?.gender || "n/a"}</p>
                        <p><strong>Age:</strong> {consultationData?.age ?? "n/a"}</p>
                        <p><strong>Height:</strong> {consultationData?.height != null ? `${consultationData.height} cm` : "n/a"}</p>
                        <p><strong>Weight:</strong> {consultationData?.weight != null ? `${consultationData.weight} kg` : "n/a"}</p>
                        <p><strong>Risk:</strong> <span className={riskClassName}>{riskText}</span></p>
                        <p><strong>Severity:</strong> {consultationData?.severity || "n/a"}</p>
                        <p><strong>Created:</strong> {consultationData?.createdAt ? new Date(consultationData.createdAt).toLocaleString() : "n/a"}</p>
                    </div>
                )}
            </section>

            {/* Two-pane workspace: voice interaction on left, text chat on right. */}
            <div className="consultation-grid">
                <section className="consultation-card">
                    <h3>Talk</h3>
                    <VoiceChat
                        setChatMessage={setChatMessage}
                        onSendMessage={handleSendMessage}
                    />
                </section>

                <section className="consultation-card">
                    <h3>Chat</h3>
                    <ConsultationChat
                        consultationId={activeConsultationId}
                        messages={messages}
                        loadingHistory={loadingHistory}
                        loadingChat={loadingChat}
                        error={chatError}
                        chatMessage={chatMessage}
                        setChatMessage={setChatMessage}
                        onSendMessage={handleSendMessage}
                    />
                </section>
            </div>
        </div>
    );
}

export default Consultation;