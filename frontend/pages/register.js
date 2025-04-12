import { useRef, useState } from 'react';
import axios from '../utils/api';
import Head from 'next/head';
import './register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', blob, 'voice.wav');
        formData.append('username', username);

        try {
          const res = await axios.post('/auth/register', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          alert(res.data.message);
        } catch (err) {
          alert('Registration failed');
          console.error(err);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 5000);
    } catch (err) {
      alert('Microphone access denied or error occurred.');
      console.error(err);
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Register with Voice</h2>
            <p className="text-sm text-gray-500">Record your voice for authentication</p>
          </div>
          
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input"
          />
          
          <button
            onClick={handleStartRecording}
            disabled={!username || isRecording}
            className={`register-button ${isRecording ? 'is-recording' : 'register-button-primary'}`}
          >
            {isRecording ? (
              <>
                <span className="status-indicator status-recording"></span>
                Recording...
              </>
            ) : (
              'Register Voice'
            )}
          </button>
        </div>
      </div>
    </>
  );
}