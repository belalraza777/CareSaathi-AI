import { create } from "zustand";
import { createConsultation } from "../api/consultationApi";

const parseOptionalNumber = (value) => {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
        return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const initialForm = {
    mainSymptom: [],
    mainSymptomInput: "",
    symptomDuration: "",
    notes: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
};

export const useConsultationFormStore = create((set, get) => ({
    consultationForm: initialForm,
    loadingCreate: false,
    error: "",
    setField: (name, value) => {
        set((state) => ({
            consultationForm: { ...state.consultationForm, [name]: value },
        }));
    },
    addMainSymptom: () => {
        set((state) => {
            const value = state.consultationForm.mainSymptomInput.trim();
            if (!value) {
                return state;
            }

            return {
                consultationForm: {
                    ...state.consultationForm,
                    mainSymptom: [...state.consultationForm.mainSymptom, value],
                    mainSymptomInput: "",
                },
            };
        });
    },
    removeMainSymptom: (indexToRemove) => {
        set((state) => ({
            consultationForm: {
                ...state.consultationForm,
                mainSymptom: state.consultationForm.mainSymptom.filter((_, index) => index !== indexToRemove),
            },
        }));
    },
    setError: (message) => set({ error: message || "" }),
    resetForm: () => set({ consultationForm: initialForm }),
    // Store action keeps create flow consistent between button and keyboard submit.
    submitConsultation: async () => {
        const { consultationForm } = get();
        set({ loadingCreate: true, error: "" });

        const payload = {
            mainSymptom: consultationForm.mainSymptom,
            symptomDuration: consultationForm.symptomDuration,
            notes: consultationForm.notes,
            gender: consultationForm.gender || undefined,
            age: parseOptionalNumber(consultationForm.age),
            height: parseOptionalNumber(consultationForm.height),
            weight: parseOptionalNumber(consultationForm.weight),
        };

        const result = await createConsultation(payload);
        if (result.success) {
            set({ loadingCreate: false, consultationForm: initialForm });
            return result;
        }

        set({
            loadingCreate: false,
            error: result.message || "Failed to create consultation",
        });
        return result;
    },
    //clear form state when leaving consultation page to prevent stale data if user returns to create another consultation.
    clearFormState: () => set({ consultationForm: initialForm, error: "" }),
}));
