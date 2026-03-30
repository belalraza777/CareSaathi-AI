import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useConsultationChatStore } from "../../stores/consultationChatStore";
import ConsultationChat from "./ConsultationChat";
import "./Consultation.css";
import VoiceChat from "./VoiceChat";

function Consultation() {
    const { consultationId: routeConsultationId } = useParams();
    const activeConsultationId = routeConsultationId || "";

    const { chatMessage, messages, loadingChat, loadingHistory, error: chatError
        , setChatMessage, loadConsultationData, consultationData, loadingConsultationData, loadMessageHistory, sendMessage, resetChatState
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

    //Handle send message action; memoize to avoid unnecessary re-renders of ConsultationChat component.
    const handleSendMessage = useCallback(async (e, messageOverride = "") => {
        // Accept both form submit events and direct programmatic calls (voice flow).
        e?.preventDefault?.();
        const safeMessage = (messageOverride || trimmedChatMessage).trim();
        const res = await sendMessage(activeConsultationId, safeMessage);
        if (!res.success && !res.skipped) {
            alert(res.message || "Failed to send message");
        }
        return res?.assistantMessage || "no response";
        
    }, [activeConsultationId, trimmedChatMessage, sendMessage]);

    return (
        <div className="consultation-page">
            <h2>Consultation</h2>
            <section className="consultation-card">
                <h3>Consultation Details</h3>
                {loadingConsultationData ? (
                    <p>Loading consultation details...</p>
                ) : (
                    <div className="consultation-detail-grid">
                        <p><strong>Consultation ID:</strong> {consultationData?.consultationId || activeConsultationId || "n/a"}</p>
                        <p><strong>Main Symptoms:</strong> {consultationData?.mainSymptom?.length ? consultationData.mainSymptom.join(", ") : "n/a"}</p>
                        <p><strong>Extracted Symptoms:</strong> {consultationData?.symptom?.length ? consultationData.symptom.join(", ") : "n/a"}</p>
                        <p><strong>Duration:</strong> {consultationData?.symptomDuration || "n/a"}</p>
                        <p><strong>Gender:</strong> {consultationData?.gender || "n/a"}</p>
                        <p><strong>Age:</strong> {consultationData?.age ?? "n/a"}</p>
                        <p><strong>Height:</strong> {consultationData?.height ?? "n/a"}{consultationData?.height ? " cm" : ""}</p>
                        <p><strong>Weight:</strong> {consultationData?.weight ?? "n/a"}{consultationData?.weight ? " kg" : ""}</p>
                        <p><strong>Risk Level:</strong> {consultationData?.riskLevel || "n/a"}</p>
                        <p><strong>Severity:</strong> {consultationData?.severity || "n/a"}</p>
                        <p><strong>Notes:</strong> {consultationData?.notes || "n/a"}</p>
                        <p><strong>Created At:</strong> {consultationData?.createdAt ? new Date(consultationData.createdAt).toLocaleString() : "n/a"}</p>
                    </div>
                )}
            </section>

            <div className="consultation-grid">
                <section className="consultation-card">
                    <h3>1. Talk</h3>
                    <p>Voice flow is paused for now. Continue your consultation using chat.</p>
                    <VoiceChat
                        setChatMessage={setChatMessage}
                        onSendMessage={handleSendMessage}
                    />
                </section>

                <section className="consultation-card">
                    <h3>2. Chat</h3>
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