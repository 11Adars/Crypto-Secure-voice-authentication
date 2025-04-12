import { useState } from "react";

export default function VoiceInput({ onSuccess }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [username, setUsername] = useState("");

  const startRecording = async () => {
    if (!username) {
      alert("Please enter your username.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("username", username);
        formData.append("audio", blob, "voice.wav"); // Ensure field name matches multer config

        try {
          const res = await fetch("http://localhost:5000/api/auth/voice-auth", {
            method: "POST",
            body: formData,
          });

          const result = await res.json();

          // ✅ Use only `result.success` instead of `res.ok`
          if (result.success) {
            alert("Authenticated successfully!");
            onSuccess();
          } else {
            alert("Authentication failed. Try again.");
            console.error("[Voice Auth Error]", result);
          }
        } catch (error) {
          alert("Server error. Check backend.");
          console.error("Fetch error:", error);
        }
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);

      // Stop recording after 5 seconds
      setTimeout(() => {
        recorder.stop();
        setRecording(false);
      }, 5000);
    } catch (err) {
      alert("Could not access microphone.");
      console.error("Mic access error:", err);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Login with your voice</h2>
      <input
        type="text"
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        onClick={startRecording}
        disabled={recording || !username}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {recording ? "Recording..." : "Start Voice Login"}
      </button>
    </div>
  );
}
