import { useRef, useState, useEffect } from 'react';
import axios from '../utils/api';
import Head from 'next/head';
import Link from 'next/link';
import './register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState('ready');
  const [errorMessage, setErrorMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationRef = useRef();
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  const visualizeAudio = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 32;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setAudioLevel(Math.min(average / 2.55, 100));
      animationRef.current = requestAnimationFrame(updateVisualization);
    };

    animationRef.current = requestAnimationFrame(updateVisualization);
  };

  const handleStartRecording = async () => {
    if (!username) {
      setStatus('username-required');
      setTimeout(() => setStatus('ready'), 2000);
      return;
    }

    try {
      setStatus('initializing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = stream;
      visualizeAudio(stream);

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      recorder.onstop = async () => {
        setStatus('processing');
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('username', username);
        formData.append('audio', blob, 'voice.wav');

        try {
          const res = await axios.post('/auth/register', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (res.data.success) {
            setStatus('success');
            setTimeout(() => {
              setStatus('ready');
              setIsRecording(false);
            }, 2000);
          } else {
            throw new Error(res.data.message || 'Registration failed');
          }
        } catch (err) {
          if (err.response) {
            if (err.response.status === 409) {
              setStatus('duplicate-error');
            } else {
              setStatus('error');
            }
            setErrorMessage(err.response.data.message || 'Registration failed');
          } else {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
          }
          setTimeout(() => setStatus('ready'), 2000);
          console.error('Registration error:', err);
        }
      };
      recorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus('recording');

      // Stop recording after 5 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 5000);

    } catch (err) {
      console.error('Microphone access error:', err);
      setStatus('mic-error');
      setTimeout(() => setStatus('ready'), 2000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setStatus('ready');
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function
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
    const statusConfig = {
      'username-required': {
        message: 'Please enter your username',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 11v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        ),
        statusClass: 'warning'
      },
      'initializing': {
        message: 'Initializing microphone...',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        ),
        statusClass: 'info'
      },
      'recording': {
        message: 'Speak now - Recording your voice...',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" fill="#ef4444" stroke="none"/>
          </svg>
        ),
        statusClass: 'recording'
      },
      'processing': {
        message: 'Processing your voiceprint...',
        icon: (
          <svg className="status-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v4m0 12v4m6-18h4m-16 0H4m14.485 14.485l2.121 2.121M4.393 4.393l2.121 2.121"/>
          </svg>
        ),
        statusClass: 'processing'
      },
      'success': {
        message: 'Registration successful!',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ),
        statusClass: 'success'
      },
      'error': {
        message: errorMessage || 'Registration failed. Try again.',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/>
          </svg>
        ),
        statusClass: 'error'
      },
      'duplicate-error': {
        message: 'User already exists. Please choose a different username.',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        ),
        statusClass: 'error'
      },
      'mic-error': {
        message: 'Microphone access denied. Please allow microphone access.',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            <path d="M12 6v4m0 4h.01" strokeWidth="2"/>
          </svg>
        ),
        statusClass: 'warning'
      },
      'ready': {
        message: 'Ready to register',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
          </svg>
        ),
        statusClass: 'info'
      }
    };

    const currentStatus = statusConfig[status] || statusConfig['ready'];

    return (
      <div
        className="status-message"
        data-status={currentStatus.statusClass}
      >
        {currentStatus.icon}
        <span>{currentStatus.message}</span>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Voice Registration | SecureAuth</title>
        <meta name="description" content="Register your voice for secure authentication" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="company-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4361ee"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#4361ee"/>
                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#4361ee"/>
              </svg>
              <span>SecureVoice</span>
            </div>
            <h1>Voice Registration</h1>
            <p>Create your secure voiceprint for authentication</p>
          </div>
          
          <div className="voice-auth-container">
            <div className="voice-input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className={`voice-input ${status === 'username-required' ? 'error' : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={status === 'processing' || status === 'recording'}
              />
            </div>
            
            <div className="voice-visualizer">
              <div 
                className="voice-level" 
                style={{ width: `${audioLevel}%`, opacity: isRecording ? 1 : 0.5 }}
              />
            </div>
            
            <div className="status-message">
              {getStatusMessage()}
            </div>
            
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={!username || status === 'processing'}
                className="auth-button"
              >
                Register Voice
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="auth-button recording"
              >
                <span className="recording-indicator"></span>
                Stop Recording
              </button>
            )}
            
            <div className="voice-tips">
              <div className="tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Speak naturally in a quiet environment</span>
              </div>
              <div className="tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <span>Hold the microphone about 6 inches away</span>
              </div>
            </div>
          </div>
          
          <div className="auth-footer">
            <Link href="/" passHref legacyBehavior>
              <button className="back-home-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home
              </button>
            </Link>
            <div className="security-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
}