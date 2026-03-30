import { useMemo } from "react";
import "./Consultation.css";

function ConsultationChat({
    consultationId,
    messages,
    loadingHistory,
    loadingChat,
    error,
    chatMessage,
    setChatMessage,
    onSendMessage,
}) {
    // Main consultation page controls state and actions; this component only renders UI.
    // Memoize mapped message JSX to avoid rebuilding it when non-message state changes.
    const renderedMessages = useMemo(() => messages.map((item, index) => (
        <p key={`${item.role}-${index}`}>
            <strong>{item.role === "user" ? "You" : "AI Doctor"}:</strong> {item.message}
        </p>
    )), [messages]);

    // Keep tiny input translation local so main page stays focused on data flow.
    const handleChatMessageChange = (e) => {
        setChatMessage(e.target.value);
    };

    return (
        <div>
            {error && <p className="consultation-error">{error}</p>}

            <p>Consultation ID: {consultationId || "Create consultation from Talk section"}</p>

            {consultationId ? (
                loadingHistory ? (
                    <p>Loading message history...</p>
                ) : (
                <div className="consultation-chat-box">
                    {renderedMessages}
                </div>
                )
            ) : (
                <p>Start a consultation from Talk section, then open its chat URL to continue here.</p>
            )}

            <form onSubmit={onSendMessage}>
                <div className="consultation-row">
                    <input
                        className="consultation-input"
                        type="text"
                        value={chatMessage}
                        onChange={handleChatMessageChange}
                        placeholder="Type your message"
                        disabled={!consultationId}
                    />
                    <button className="consultation-button" type="submit" disabled={loadingChat || !consultationId}>
                        {loadingChat ? "Sending..." : "Send"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ConsultationChat;