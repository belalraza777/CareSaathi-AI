import { create } from "zustand";
import { getConsultations } from "../api/consultationApi";

export const useHomeStore = create((set) => ({
    consultations: [],
    loadingConsultations: true,
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
}));
