import { useRef, useState } from "react";
import {
  startRecording,
  stopRecordingAndTranscribe,
} from "./sstService.js";
import { speakText } from "./ttsService.js";

export default function VoiceChat({ setChatMessage, onSendMessage }) {
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = () => {
    startRecording(mediaRecorderRef, audioChunks);
    // Indicate recording is active
    setIsListening(true);
  };

  const handleStop = async () => {
    // Stop listening and start processing
    setIsListening(false);
    setIsProcessing(true);
    try {
      const result = await stopRecordingAndTranscribe(
        mediaRecorderRef,
        audioChunks
      );
      if (!result || result.trim() === "") {
        setText("No speech detected. Please try again.");
        return;
      }
      setChatMessage(result);
      const assistantMessage = await onSendMessage(undefined, result);
      setText(assistantMessage);
      await speakText(assistantMessage);
    }
    catch (error) {
      console.error("Error processing voice input:", error);
    }
    finally {
      // Mark processing complete
      setIsProcessing(false);
      setChatMessage("");
    }
  };

  return (
    <div>
      <h2>🎤 AI Doctor Voice</h2>

      <div>
        <button onClick={handleStart} disabled={isListening || isProcessing}>
          {isListening ? " Listening..." : "Start"}
        </button>
      </div>
      <div>
        <button onClick={handleStop} disabled={!isListening || isProcessing}>
          {isProcessing ? " Processing..." : "Stop"}
        </button>
      </div>
      <p>{text}</p>
    </div>
  );
}