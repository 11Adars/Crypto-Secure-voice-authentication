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

  const visualizeAudio = (stream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 32;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setAudioLevel(Math.min(average / 2.55, 100)); // Convert to percentage
      animationRef.current = requestAnimationFrame(updateVisualization);
    };

    animationRef.current = requestAnimationFrame(updateVisualization);
  };

  const startRecording = async () => {
    if (!username) {
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
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        setStatus("processing");
        const blob = new Blob(chunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("username", username);
        formData.append("audio", blob, "voice.wav");

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
        } catch (error) {
          setStatus("error");
          setTimeout(() => setStatus("ready"), 2000);
        }
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
      setStatus("recording");

      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setRecording(false);
        }
      }, 5000);
    } catch (err) {
      setStatus("mic-error");
      setTimeout(() => setStatus("ready"), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case "username-required": return "Please enter your username";
      case "initializing": return "Initializing microphone...";
      case "recording": return "Speak now - Listening...";
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
          disabled={status === "processing" || status === "recording"}
        />
      </div>
      
      <div className="voice-visualizer">
        <div 
          className="voice-level" 
          style={{ width: `${audioLevel}%`, opacity: recording ? 1 : 0.5 }}
        />
      </div>
      
      <div className="status-message">
        {getStatusMessage()}
      </div>
      
      <button
        onClick={startRecording}
        disabled={status === "processing" || status === "recording" || status === "initializing"}
        className={`auth-button ${status === "recording" ? "recording" : ""} ${status === "processing" ? "processing" : ""}`}
      >
        {status === "recording" ? (
          <>
            <span className="recording-indicator"></span>
            Recording...
          </>
        ) : status === "processing" ? (
          <>
            <span className="processing-indicator"></span>
            Processing...
          </>
        ) : (
          "Start Voice Authentication"
        )}
      </button>
      
      <div className="voice-tips">
        <div className="tip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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