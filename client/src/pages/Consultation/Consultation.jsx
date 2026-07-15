import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle, FiMic, FiMessageCircle } from "react-icons/fi";
import { useConsultationChatStore } from "../../stores/consultationChatStore";
import ConsultationChat from "./ConsultationChat";
import ConsultationDetails from "./ConsultationDetails";
import "./Consultation.css";
import VoiceChat from "./VoiceChat";

function Consultation() {
    // Read consultation id from URL and keep a safe fallback string.
    const { consultationId: routeConsultationId } = useParams();
    const activeConsultationId = routeConsultationId || "";

    // Which workspace pane is visible: "voice" (Talk) or "chat" (Chat).
    const [activeMode, setActiveMode] = useState("chat");

    // Pull chat state, consultation state, and actions from the shared store.
    const {
        chatMessage,
        messages,
        loadingChat,
        loadingHistory,
        error: chatError,
        setChatMessage,
        selectedImage,
        setSelectedImage,
        loadConsultationData,
        refreshConsultationData,
        consultationData,
        loadingConsultationData,
        loadMessageHistory,
        sendMessage,
        resetChatState
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
    const handleSendMessage = useCallback(async (e, messageOverride = "") => {
        // Accept both form submit events and direct programmatic calls.
        e?.preventDefault?.();

        const safeMessage = (messageOverride || trimmedChatMessage).trim();

        const res = await sendMessage(
            activeConsultationId,
            safeMessage,
            selectedImage
        );

        if (!res.success) {
            return "";
        }

        // Refresh risk after each message.
        refreshConsultationData(activeConsultationId);

        return res?.assistantMessage || "";
    }, [
        activeConsultationId,
        trimmedChatMessage,
        sendMessage,
        refreshConsultationData,
        selectedImage
    ]);

    // Critical risk still drives the full-screen overlay here, so it stays local.
    const isCriticalRisk =
        String(consultationData?.riskLevel || "").toLowerCase() === "critical";

    // Freeze page scroll while emergency overlay is open.
    useEffect(() => {
        if (!isCriticalRisk) {
            return;
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
                <div className="consultation-critical-overlay" role="alertdialog" aria-modal="true">
                    <section className="consultation-critical-card">
                        <div className="consultation-critical-icon">
                            <FiAlertTriangle />
                        </div>

                        <p className="consultation-critical-badge">
                            Critical Emergency
                        </p>

                        <h3>
                            Immediate in-person care needed
                        </h3>

                        <div className="consultation-critical-message-list">
                            <p>Call emergency services right now.</p>
                            <p>Go to the nearest emergency hospital immediately.</p>
                        </div>
                    </section>
                </div>
            )}

            {/* Consultation summary section shows latest clinical metadata for context. */}
            <h2>
                Consultation
            </h2>

            <ConsultationDetails
                consultationData={consultationData}
                loadingConsultationData={loadingConsultationData}
                fallbackConsultationId={activeConsultationId}
            />

            {/* Mode toggle swaps the workspace between voice ("Talk") and text ("Chat"). */}
            <div
                className="consultation-mode-toggle"
                role="tablist"
                aria-label="Choose how to communicate"
            >
                <span
                    className={`consultation-mode-toggle__thumb consultation-mode-toggle__thumb--${activeMode}`}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "voice"}
                    className={`consultation-mode-toggle__option${activeMode === "voice" ? " is-active" : ""}`}
                    onClick={() => setActiveMode("voice")}
                >
                    <FiMic aria-hidden="true" />
                    <span>Talk</span>
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "chat"}
                    className={`consultation-mode-toggle__option${activeMode === "chat" ? " is-active" : ""}`}
                    onClick={() => setActiveMode("chat")}
                >
                    <FiMessageCircle aria-hidden="true" />
                    <span>Chat</span>
                </button>
            </div>

            {/* Single active workspace pane, driven by the toggle above. */}
            <div className="consultation-panes">

                {activeMode === "voice" ? (
                    <section
                        key="voice"
                        className="consultation-card consultation-pane"
                        role="tabpanel"
                        aria-label="Talk"
                    >

                        <h3>
                            Talk
                        </h3>

                        <VoiceChat
                            setChatMessage={setChatMessage}
                            onSendMessage={handleSendMessage}
                        />

                    </section>
                ) : (
                    <section
                        key="chat"
                        className="consultation-card consultation-pane"
                        role="tabpanel"
                        aria-label="Chat"
                    >

                        <h3>
                            Chat
                        </h3>

                        <ConsultationChat
                            consultationId={activeConsultationId}
                            messages={messages}
                            loadingHistory={loadingHistory}
                            loadingChat={loadingChat}
                            error={chatError}
                            chatMessage={chatMessage}
                            setChatMessage={setChatMessage}
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            onSendMessage={handleSendMessage}
                        />

                    </section>
                )}

            </div>

        </div>
    );
}

export default Consultation;