// 🔊 TTS SERVICE (Google / Browser Speech API)

// This service handles text-to-speech (TTS) functionality for the application. It uses the ElevenLabs API for TTS if an API key is provided, and falls back to the browser's built-in speech synthesis if not.
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

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: safeText,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
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