import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	FiMic,
	FiMicOff,
	FiVideo,
	FiStopCircle,
	FiUser,
} from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";

import {
  startRecording,
  stopRecordingAndTranscribe,
} from "./sstService.js";
import { speakText } from "./ttsService.js";
import { formatAiResponseForTts } from "./voiceResponseFormatter.js";
import "./VoiceChat.css";

export default function VoiceChat({ setChatMessage, onSendMessage }) {
  // Keep recorder and UI flags in component state for the full voice flow.
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    try {
      // Reset previous data, then start microphone capture.
      audioChunks.current = [];
      setText("Listening... Please speak naturally.");
      setIsProcessing(false);
      await startRecording(mediaRecorderRef, audioChunks);
      setIsListening(true);
      toast.message("Listening started", { description: "Talk to your AI doctor." });
    } catch (error) {
      console.error("Microphone start error:", error);
      setIsListening(false);
      toast.error("Microphone access failed. Check browser permissions and try again.");
    }
  };

  const handleStop = async () => {
    // Stop listening and start processing
    setIsListening(false);
    setIsProcessing(true);
    try {
      // Convert recorded audio into text.
      const result = await stopRecordingAndTranscribe(
        mediaRecorderRef,
        audioChunks
      );
      const normalizedResult = String(result || "").trim();
      const isNoSpeechPlaceholder = /^no speech detected\.?$/i.test(normalizedResult);

      if (!normalizedResult || isNoSpeechPlaceholder) {
        setText("No speech detected. Please try again.");
        toast.warning("No speech detected. Try again when ready.");
        return;
      }

      // Show transcript first for a “live” feel.
      setText(normalizedResult);
      setChatMessage(normalizedResult);

      // Send transcript to AI and speak the doctor response.
      const assistantMessage = await onSendMessage(undefined, normalizedResult);
      if (!assistantMessage) {
        setText("Failed to send message. Please try again.");
        toast.error("Failed to send voice message. Please try again.");
        return;
      }
      const ttsFriendlyMessage = formatAiResponseForTts(assistantMessage) || assistantMessage;
      setText(ttsFriendlyMessage);
      await speakText(ttsFriendlyMessage);
    }
    catch (error) {
      console.error("Error processing voice input:", error);
      toast.error("Voice processing failed. Please try again.");
    }
    finally {
      // Mark processing complete
      setIsProcessing(false);
      setChatMessage("");
    }
  };

  return (
    <div className="voicechat" aria-busy={isListening || isProcessing}>
      {/* Header block: title, helper text, and current status pill. */}
      <div className="voicechat-header">
        <div>
          <h2 className="voicechat-title">AI Doctor Voice</h2>
          <p className="voicechat-hint" style={{ marginTop: 6 }}>
            Start talking and press Stop when done.
          </p>
        </div>

        {isListening ? (
          <div className="voicechat-pill voicechat-pill--listening">
            <FiMic /> Listening...
          </div>
        ) : isProcessing ? (
          <div className="voicechat-pill voicechat-pill--processing">
            <FaStethoscope /> Doctor is responding...
          </div>
        ) : (
          <div className="voicechat-pill voicechat-pill--idle">
            <FiVideo /> Ready
          </div>
        )}
      </div>

      {/* Conversation block: local user panel and doctor panel. */}
      <div className="voicechat-videogrid">
        <div
          className={[
            "voicechat-video",
            "voicechat-video--local",
            isListening ? "is-listening" : "",
          ].join(" ")}
        >
          <div className="voicechat-videoLabel">
            <FiUser /> You
          </div>

          <div className="voicechat-videoCenter">
            <div className="voicechat-avatar" aria-hidden="true">
              {isListening ? <FiMic /> : <FiMicOff />}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div className={["voicechat-waveform", "voicechat-waveform--local", isListening ? "is-active" : ""].join(" ")} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div
          className={[
            "voicechat-video",
            "voicechat-video--doctor",
            isProcessing ? "is-processing" : "",
          ].join(" ")}
        >
          <div className="voicechat-videoLabel">
            <FaStethoscope /> Doctor
          </div>

          <div className="voicechat-videoCenter">
            <div className="voicechat-avatar" aria-hidden="true">
              <FaUserDoctor />

            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div
              className={[
                "voicechat-waveform",
                "voicechat-waveform--doctor",
                isProcessing ? "is-active" : "",
              ].join(" ")}
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* Control block: start and stop actions. */}
      <div className="voicechat-controls">
        <button
          className="voicechat-btn"
          type="button"
          onClick={handleStart}
          disabled={isListening || isProcessing}
        >
          <FiMic />
          {isListening ? "Listening..." : "Start talking"}
        </button>

        <button
          className="voicechat-btn voicechat-btn--danger"
          type="button"
          onClick={handleStop}
          disabled={!isListening || isProcessing}
        >
          <FiStopCircle />
          {isProcessing ? "Processing..." : "Stop"}
        </button>
      </div>

      {/* Transcript block: live text + spoken reply preview. */}
      <div className="voicechat-transcript">
        <p>{text || "Press Start and speak to your AI doctor."}</p>
      </div>
    </div>
  );
}