import { create } from "zustand";
import { chatWithConsultation, getConsultationDetail, getConsultationMessages } from "../api/consultationApi";

export const useConsultationChatStore = create((set, get) => ({
    chatMessage: "", // Current input value for the chat message.
    messages: [],   // Array of message objects in the current consultation chat.
    consultationData: null,
    loadingChat: false,
    loadingHistory: true,
    loadingConsultationData: false,
    error: "",
    selectedImage: null, // Currently selected image file for sending with a message.
    setSelectedImage: (file) => set({ selectedImage: file }),

    // Action to update the current chat message input.
    setChatMessage: (value) => set({ chatMessage: value }),
    clearError: () => set({ error: "" }),
    // Reset chat state to initial values, typically when starting a new consultation or if consultation ID is cleared.
    resetChatState: () => {
        set({
            chatMessage: "",
            messages: [],
            consultationData: null,
            loadingChat: false,
            loadingHistory: true,
            loadingConsultationData: false,
            error: "",
        });
    },
    // Load consultation detail payload for current consultation session.
    loadConsultationData: async (consultationId) => {
        if (!consultationId) {
            set({ consultationData: null, loadingConsultationData: false, error: "Consultation ID is required" });
            return;
        }

        set({ loadingConsultationData: true, error: "" });
        const result = await getConsultationDetail(consultationId);
        if (result.success) {
            set({ consultationData: result.data || null, loadingConsultationData: false });
            return;
        }

        set({
            consultationData: null,
            error: result.message || "Failed to load consultation details",
            loadingConsultationData: false,
        });
    },
    // Refresh consultation data without toggling loading flags to keep chat UI smooth.
    refreshConsultationData: async (consultationId) => {
        if (!consultationId) {
            return;
        }

        const result = await getConsultationDetail(consultationId);
        if (!result.success) {
            return;
        }

        set((state) => ({
            consultationData: state.consultationData
                ? { ...state.consultationData, ...(result.data || {}) }
                : (result.data || null),
        }));
    },
    // Load message history for a given consultation ID; handles loading state and errors.
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
    // Send and append both user and assistant messages from one action.
    sendMessage: async (consultationId, messageText, imageFile) => {
        const safeMessage = messageText?.trim();

        const {loadingChat} = get();

        if ((!safeMessage && !imageFile) || !consultationId || loadingChat) {
            return { success: false, skipped: true };
        }
        set((state) => ({
            error: "",
            loadingChat: true,
            chatMessage: "",
            messages: [
                ...state.messages,
                {
                    role: "user",
                    message:
                        safeMessage ||
                        "[Image uploaded]"
                }
            ]
        }));

        const result = await chatWithConsultation(
            consultationId,
            safeMessage || "",
            imageFile
        );

        if (result.success) {
            set((state) => ({
                loadingChat: false,
                selectedImage: null,
                messages: [
                    ...state.messages,
                    {
                        role: "assistant",
                        message: result.response
                    }
                ]
            }));

            return {
                success: true,
                assistantMessage: result.response
            };
        }

        set({
            loadingChat: false,
            error: result.message
        });

        return {
            success: false,
            message: result.message
        };
    },
}));
