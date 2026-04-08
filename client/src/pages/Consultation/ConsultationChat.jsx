import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { FiSend, FiUser } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import ChatMarkdown from "../../components/markdown/ChatMarkdown";
import "./ConsultationChat.css";

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
    const lastErrorRef = useRef("");
    const chatLogRef = useRef(null);

    useEffect(() => {
        if (!error) return;
        if (lastErrorRef.current === error) return;
        lastErrorRef.current = error;
        toast.error(error);
    }, [error]);

    useEffect(() => {
        if (!chatLogRef.current) return;
        // Keep the latest message in view.
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }, [messages, loadingChat, loadingHistory]);

    // Memoize mapped message JSX to avoid rebuilding it when non-message state changes.
    const renderedMessages = useMemo(
        () =>
            messages.map((item, index) => {
                const isUser = item.role === "user";
                const bubbleContent = isUser ? (
                    item.message
                ) : (
                    <ChatMarkdown content={item.message} />
                );

                return (
                    <div
                        key={`${item.role}-${index}`}
                        className={["chat-row", isUser ? "chat-row--user" : "chat-row--ai"].join(" ")}
                    >
                        <div className="chat-avatar" aria-hidden="true">
                            {isUser ? <FiUser /> : <FaStethoscope />}
                        </div>
                        <div className="chat-bubble">{bubbleContent}</div>
                    </div>
                );
            }),
        [messages]
    );

    // Keep tiny input translation local so main page stays focused on data flow.
    const handleChatMessageChange = (e) => {
        setChatMessage(e.target.value);
    };

    return (
        <div>
            {error && <p className="consultation-error">{error}</p>}

            {!consultationId ? (
                <p className="consultation-muted">Start talking to create a consultation, then continue in chat.</p>
            ) : (
                <div className="consultation-chat-box">
                    <div
                        className="chat-log"
                        ref={chatLogRef}
                        role="log"
                        aria-live="polite"
                    >
                        {loadingHistory ? (
                            <div className="chat-row chat-row--ai">
                                <div className="chat-avatar" aria-hidden="true">
                                    <FaStethoscope />
                                </div>
                                <div className="chat-bubble">Loading message history...</div>
                            </div>
                        ) : (
                            renderedMessages
                        )}

                        {loadingChat && !loadingHistory && (
                            <div className="chat-row chat-row--ai">
                                <div className="chat-avatar" aria-hidden="true">
                                    <FaStethoscope />
                                </div>
                                <div className="chat-bubble">
                                    <div className="chat-typing" aria-label="Doctor is typing">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={onSendMessage} className="consultation-chat-actions">
                <div className="consultation-row">
                    <input
                        className="consultation-input"
                        type="text"
                        value={chatMessage}
                        onChange={handleChatMessageChange}
                        placeholder="Type your message"
                        disabled={!consultationId}
                    />
                    <button
                        className="consultation-button"
                        type="submit"
                        disabled={loadingChat || !consultationId}
                    >
                        <FiSend />
                        {loadingChat ? "Sending..." : "Send"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ConsultationChat;