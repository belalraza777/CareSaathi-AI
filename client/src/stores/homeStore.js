import { create } from "zustand";
import { deleteConsultation as deleteConsultationRequest, getConsultations } from "../api/consultationApi";

export const useHomeStore = create((set) => ({
    consultations: [],
    loadingConsultations: true,
    deletingConsultationId: "",
    error: "",
    // Keep dashboard consultation loading logic centralized in the store.
    loadConsultations: async () => {
        set({ loadingConsultations: true, error: "" });
        const result = await getConsultations();
        if (result.success) {
            set({ consultations: result.data || [], loadingConsultations: false });
            return;
        }

        set({
            consultations: [],
            error: result.message || "Failed to load consultations",
            loadingConsultations: false,
        });
    },
    // Keep delete side effects centralized so list UIs stay simple.
    deleteConsultation: async (consultationId) => {
        if (!consultationId) {
            return { success: false, message: "Consultation ID is required" };
        }

        set({ deletingConsultationId: consultationId, error: "" });
        const result = await deleteConsultationRequest(consultationId);

        if (result.success) {
            set((state) => ({
                consultations: state.consultations.filter((item) => item.consultationId !== consultationId),
                deletingConsultationId: "",
            }));
            return { success: true, message: result.message || "Consultation deleted successfully" };
        }

        set({
            deletingConsultationId: "",
            error: result.message || "Failed to delete consultation",
        });
        return { success: false, message: result.message || "Failed to delete consultation" };
    },
}));
