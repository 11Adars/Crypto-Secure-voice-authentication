import { useState, useRef, useEffect } from "react";

export default function VoiceInput({ onSuccess }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [username, setUsername] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState("ready");

  const animationRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const microphoneRef = useRef();
  const chunks = useRef([]);
  const recordStartTime = useRef(null);

  const visualizeAudio = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 32;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
      setAudioLevel(Math.min(avg / 2.55, 100));
      animationRef.current = requestAnimationFrame(update);
    };

    update();
  };

  const startRecording = async () => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setStatus("username-required");
      setTimeout(() => setStatus("ready"), 2000);
      return;
    }

    try {
      setStatus("initializing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = stream;
      visualizeAudio(stream);

      const recorder = new MediaRecorder(stream);
      chunks.current = [];

      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = async () => {
        cancelAnimationFrame(animationRef.current);
        audioContextRef.current?.close();
        microphoneRef.current?.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        const durationSec = (Date.now() - recordStartTime.current) / 1000;

        if (durationSec < 3) {
          setStatus("too-short");
          setTimeout(() => setStatus("ready"), 2000);
          return;
        }

        setStatus("processing");
        const formData = new FormData();
        formData.append("username", cleanUsername);
        formData.append("audio", audioBlob, "voice.wav");

        try {
          const res = await fetch("http://localhost:5000/api/auth/voice-auth", {
            method: "POST",
            body: formData,
          });

          const result = await res.json();

          if (result.success) {
            setStatus("success");
            setTimeout(onSuccess, 1000);
          } else {
            setStatus("error");
            setTimeout(() => setStatus("ready"), 2000);
          }
        } catch {
          setStatus("error");
          setTimeout(() => setStatus("ready"), 2000);
        }
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
      recordStartTime.current = Date.now();
      setStatus("recording");

      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
          setRecording(false);
        }
      }, 9000);
    } catch {
      setStatus("mic-error");
      setTimeout(() => setStatus("ready"), 2000);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContextRef.current?.close();
      microphoneRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case "username-required": return "Please enter your username";
      case "initializing": return "Initializing microphone...";
      case "recording": return "Speak now - Listening...";
      case "too-short": return "Voice too short. Speak at least 3 seconds.";
      case "processing": return "Verifying your voice...";
      case "success": return "Authentication successful!";
      case "error": return "Verification failed. Try again.";
      case "mic-error": return "Microphone access denied";
      default: return "Ready to authenticate";
    }
  };

  return (
    <div className="voice-auth-container">
      <div className="voice-input-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          className={`voice-input ${status === "username-required" ? "error" : ""}`}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={status !== "ready"}
        />
      </div>

      <div className="voice-visualizer">
        <div className="voice-level" style={{ width: `${audioLevel}%`, opacity: recording ? 1 : 0.5 }} />
      </div>

      <div className="status-message">{getStatusMessage()}</div>

      <button
        onClick={startRecording}
        disabled={status !== "ready"}
        className={`auth-button ${status}`}
      >
        {status === "recording" ? "Recording..." :
         status === "processing" ? "Processing..." :
         "Start Voice Authentication"}
      </button>

      <div className="voice-tips">
        <div className="tip">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Speak naturally in a quiet environment</span>
        </div>
      </div>
    </div>
  );
}
