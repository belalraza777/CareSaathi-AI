// 🔊 TTS SERVICE (Google / Browser Speech API)

export const speakText = (text) => {
  try {
    //  If not supported
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

    //  Stop previous speech (important)
    window.speechSynthesis.cancel();

    //  Create speech instance
    const utterance = new SpeechSynthesisUtterance(
      text?.trim() || "Hello, I am your AI doctor."
    );

    //  Language
    utterance.lang = "hi-IN"; // English with Indian accent

    //  Make it sound better
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    //  Get available voices
    const voices = window.speechSynthesis.getVoices();

    //  Try to pick best Google voice
    const preferredVoice =
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.lang === "hi-IN") ||
      voices[0]; // fallback to first available

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    //  Speak
    window.speechSynthesis.speak(utterance);

  } catch (err) {
    console.error("TTS Error:", err);
  }
};







// import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';

// export const speakText = async (text) => {
//     const apiKey = import.meta.env.VITE_ELEVENLAB_API_KEY;
//     if (!apiKey) throw new Error("Missing ElevenLabs API key");

//     const elevenlabs = new ElevenLabsClient({ apiKey });
//     try {
//         // Keep a fallback so TTS always has a prompt to speak.
//         const audio = await elevenlabs.textToSpeech.convert("QO2wwSVI9F7DwU5uUXDX", {
//             text: text?.trim() || "Hello, mai aapka AI doctor hoon.",
//             modelId: "eleven_multilingual_v2",
//             outputFormat: "mp3_44100_128",
//         });
//         await play(audio);
//     } catch (err) {
//         console.error("TTS Error:", err);
//         throw new Error(err.message || "Error generating speech");
//     }
// };

