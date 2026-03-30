import { create } from "zustand";

const initialVoiceState = {
    isSupported: false, // Will be set to true if browser supports Web Speech API
    isListening: false, // Indicates if voice recognition is currently active
    isSpeaking: false, // Indicates if text-to-speech is currently active
    transcript: "",  // Holds the current voice input transcript
    autoSpeak: true, // If true, the app will automatically speak assistant responses
    voiceError: "", // Holds any error messages related to voice features
};


export const useVoiceStore = create((set) => ({
    ...initialVoiceState,
    
    setIsSupported: (value) => set({ isSupported: value }),
    setIsListening: (value) => set({ isListening: value }),
    setIsSpeaking: (value) => set({ isSpeaking: value }),
    setTranscript: (value) => set({ transcript: value }),
    clearTranscript: () => set({ transcript: "" }),
    setAutoSpeak: (value) => set({ autoSpeak: value }),
    toggleAutoSpeak: () => set((state) => ({ autoSpeak: !state.autoSpeak })),
    setVoiceError: (value) => set({ voiceError: value }),
    clearVoiceError: () => set({ voiceError: "" }),
    resetVoiceState: () => set(initialVoiceState),
}));
