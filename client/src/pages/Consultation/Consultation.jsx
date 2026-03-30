import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useConsultationChatStore } from "../../stores/consultationChatStore";
import ConsultationChat from "./ConsultationChat";
import "./Consultation.css";
import VoiceChat from "./VoiceChat";

function Consultation() {
    const { consultationId: routeConsultationId } = useParams();
    const activeConsultationId = routeConsultationId || "";

    const chatMessage = useConsultationChatStore((state) => state.chatMessage);
    const messages = useConsultationChatStore((state) => state.messages);
    const loadingChat = useConsultationChatStore((state) => state.loadingChat);
    const loadingHistory = useConsultationChatStore((state) => state.loadingHistory);
    const chatError = useConsultationChatStore((state) => state.error);
    const setChatMessage = useConsultationChatStore((state) => state.setChatMessage);
    const loadMessageHistory = useConsultationChatStore((state) => state.loadMessageHistory);
    const sendMessage = useConsultationChatStore((state) => state.sendMessage);
    const resetChatState = useConsultationChatStore((state) => state.resetChatState);

    useEffect(() => {
        // Keep chat state in sync with consultation id from the route.
        if (!routeConsultationId) {
            resetChatState();
            return;
        }
        loadMessageHistory(routeConsultationId);
    }, [routeConsultationId, loadMessageHistory, resetChatState]);

    // Trim chat message to prevent sending messages with only whitespace.
    const trimmedChatMessage = useMemo(() => chatMessage.trim(), [chatMessage]);

    //Handle send message action; memoize to avoid unnecessary re-renders of ConsultationChat component.
    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        await sendMessage(activeConsultationId, trimmedChatMessage);
    }, [activeConsultationId, trimmedChatMessage, sendMessage]);


    return (
        <div className="consultation-page">
            <h2>Consultation</h2>
            <div className="consultation-grid">
                <section className="consultation-card">
                    <h3>1. Talk</h3>
                    <p>Voice flow is paused for now. Continue your consultation using chat.</p>
                    <VoiceChat />
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