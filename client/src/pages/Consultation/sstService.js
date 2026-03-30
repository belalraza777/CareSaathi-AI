import {toEnglishLetters} from "./transliterate.js";

// Function to record audio from mic
export const startRecording = async (mediaRecorderRef, audioChunks) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // collect audio chunks
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
    };

    mediaRecorder.start();
};

// Function to stop recording & get transcript
export const stopRecordingAndTranscribe = async (
    mediaRecorderRef,
    audioChunks
) => {
    return new Promise((resolve, reject) => {
        mediaRecorderRef.current.onstop = async () => {
            try {
                // create audio blob
                const blob = new Blob(audioChunks.current, { type: "audio/webm" });
                audioChunks.current = [];

                // send to Deepgram
                const response = await fetch(
                    "https://api.deepgram.com/v1/listen?language=hi&model=nova-2&punctuate=true", {
                    method: "POST",
                    headers: {
                        "Content-Type": "audio/webm;codecs=opus",
                        Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
                    },
                    body: blob,
                }
                );
                
                if (!response.ok) throw new Error(`Deepgram error: ${response.status}`);
                const data = await response.json();

                // extract text from Deepgram
                let text = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
                
                // transliterate Hindi to English FIRST, before filtering
                text = toEnglishLetters(text) || text;
                
                resolve(text || "No speech detected");
            } catch (err) {
                console.error("STT Error:", err);
                reject(err.message || "Error transcribing");
            }
        };

        // stop recording
        mediaRecorderRef.current.stop();
    });
};