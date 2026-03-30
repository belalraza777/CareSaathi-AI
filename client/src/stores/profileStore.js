import { create } from "zustand";
import { createProfile, getProfile, updateProfile } from "../api/profileApi";

const makeFormFromProfile = (profile) => ({
    age: profile?.age || "",
    gender: profile?.gender || "",
    medicalHistory: profile?.medicalHistory || [],
    allergies: profile?.allergies || [],
    medications: profile?.medications || [],
});

const initialTempInput = {
    medicalHistory: "",
    allergies: "",
    medications: "",
};

export const useProfileStore = create((set, get) => ({
    profile: null,
    loading: true,
    error: null,
    isEditing: false,
    formData: makeFormFromProfile(null),
    tempInput: initialTempInput,
    setError: (message) => set({ error: message }),
    setIsEditing: (value) => set({ isEditing: value }),
    syncFormFromProfile: (profile) => {
        set({
            formData: makeFormFromProfile(profile),
            tempInput: initialTempInput,
        });
    },
    loadProfile: async () => {
        set({ loading: true });
        const result = await getProfile();
        if (result.success) {
            set({
                profile: result.data,
                loading: false,
                error: null,
                formData: makeFormFromProfile(result.data),
                tempInput: initialTempInput,
            });
            return;
        }

        set({
            profile: null,
            loading: false,
            error: result.message,
            formData: makeFormFromProfile(null),
            tempInput: initialTempInput,
        });
    },
    createProfileData: async (data) => {
        const result = await createProfile(data);
        if (result.success) {
            set({
                profile: result.data,
                error: null,
                isEditing: false,
                formData: makeFormFromProfile(result.data),
                tempInput: initialTempInput,
            });
            return result;
        }

        set({ error: result.message });
        return result;
    },
    updateProfileData: async (data) => {
        const result = await updateProfile(data);
        if (result.success) {
            set({
                profile: result.data,
                error: null,
                isEditing: false,
                formData: makeFormFromProfile(result.data),
                tempInput: initialTempInput,
            });
            return result;
        }

        set({ error: result.message });
        return result;
    },
    // Keep profile form handlers in the store so both hook and UI stay thin.
    handleInputChange: (e) => {
        const { name, value } = e.target;
        set((state) => ({
            formData: { ...state.formData, [name]: value },
        }));
    },
    handleArrayInputChange: (e, field) => {
        const inputValue = e.target.value;
        set((state) => ({
            tempInput: { ...state.tempInput, [field]: inputValue },
        }));
    },
    addArrayItem: (field) => {
        const { tempInput } = get();
        const value = tempInput[field].trim();
        if (!value) {
            return;
        }

        set((state) => ({
            formData: {
                ...state.formData,
                [field]: [...state.formData[field], value],
            },
            tempInput: { ...state.tempInput, [field]: "" },
        }));
    },
    removeArrayItem: (field, index) => {
        set((state) => ({
            formData: {
                ...state.formData,
                [field]: state.formData[field].filter((_, i) => i !== index),
            },
        }));
    },
}));
