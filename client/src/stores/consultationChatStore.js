import { create } from "zustand";
import { chatWithConsultation, getConsultationMessages } from "../api/consultationApi";

export const useConsultationChatStore = create((set, get) => ({
    chatMessage: "",
    messages: [],
    loadingChat: false,
    loadingHistory: true,
    error: "",
    setChatMessage: (value) => set({ chatMessage: value }),
    clearError: () => set({ error: "" }),
    resetChatState: () => {
        set({
            chatMessage: "",
            messages: [],
            loadingChat: false,
            loadingHistory: true,
            error: "",
        });
    },
    loadMessageHistory: async (consultationId) => {
        if (!consultationId) {
            set({ loadingHistory: false, error: "Consultation ID is required" });
            return;
        }

        set({ loadingHistory: true, error: "" });
        const result = await getConsultationMessages(consultationId);
        if (result.success) {
            set({ messages: result.data || [], loadingHistory: false });
            return;
        }

        set({
            messages: [],
            error: result.message || "Failed to load message history",
            loadingHistory: false,
        });
    },
    // Send and append both user and assistant messages from one action.
    sendMessage: async (consultationId, messageText) => {
        const safeMessage = messageText?.trim();
        const { loadingChat } = get();
        if (!safeMessage || !consultationId || loadingChat) {
            return { success: false, skipped: true };
        }

        set((state) => ({
            error: "",
            loadingChat: true,
            chatMessage: "",
            messages: [...state.messages, { role: "user", message: safeMessage }],
        }));

        const result = await chatWithConsultation(consultationId, safeMessage);
        if (result.success) {
            const assistantMessage = result.response || "No response received";
            set((state) => ({
                loadingChat: false,
                messages: [...state.messages, { role: "assistant", message: assistantMessage }],
            }));
            return { success: true, assistantMessage };
        }

        set({
            loadingChat: false,
            error: result.message || "Failed to send message",
        });
        return { success: false };
    },
}));
