// 🔊 TTS SERVICE (Google / Browser Speech API)

// export const speakText = (text) => {
//   try {
//     //  If not supported
//     if (!window.speechSynthesis) {
//       console.error("Speech synthesis not supported");
//       return;
//     }

//     //  Stop previous speech (important)
//     window.speechSynthesis.cancel();

//     //  Create speech instance
//     const utterance = new SpeechSynthesisUtterance(
//       text?.trim() || "Hello, I am your AI doctor."
//     );

//     //  Language
//     utterance.lang = "hi-IN"; // English with Indian accent

//     //  Make it sound better
//     utterance.rate = 0.9;
//     utterance.pitch = 1;
//     utterance.volume = 1;

//     //  Get available voices
//     const voices = window.speechSynthesis.getVoices();

//     //  Try to pick best Google voice
//     const preferredVoice =
//       voices.find((v) => v.name.includes("Google")) ||
//       voices.find((v) => v.lang === "hi-IN") ||
//       voices[0]; // fallback to first available

//     if (preferredVoice) {
//       utterance.voice = preferredVoice;
//     }

//     //  Speak
//     window.speechSynthesis.speak(utterance);

//   } catch (err) {
//     console.error("TTS Error:", err);
//   }
// };





import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const speakText = async (text) => {
  const apiKey = import.meta.env.VITE_ELEVENLAB_API_KEY;
  const safeText = text?.trim() || "Hello, mai aapka AI doctor hoon.";

  // If ElevenLabs isn't configured, fall back to built-in browser TTS.
  if (!apiKey) {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(safeText);
      utterance.lang = "hi-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Browser TTS fallback failed:", err);
    }
    return;
  }

  const elevenlabs = new ElevenLabsClient({ apiKey });

  try {
    const audioStream = await elevenlabs.textToSpeech.convert(
      "pNInz6obpgDQGcFmaJgB",
      {
        text: safeText,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // ✅ Validate before playing
    if (!(audioStream instanceof Uint8Array)) {
      throw new Error("Invalid audio data");
    }

    const blob = new Blob([audioStream], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    await audio.play();

  } catch (err) {
    console.warn("ElevenLabs failed → using fallback", err);

    // ✅ ALWAYS WORKS
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(safeText);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    } catch (fallbackErr) {
      console.warn("Browser TTS fallback failed:", fallbackErr);
    }
  }
};