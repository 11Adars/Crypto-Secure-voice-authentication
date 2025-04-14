// pages/login.js

import VoiceInput from "../components/VoiceInput";
import { useRouter } from "next/router";
import Link from 'next/link';
import Head from 'next/head';
import "./login.css";

export default function Login() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Secure Voice Authentication</title>
        <meta name="description" content="Biometric voice authentication system" />
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
            <h1>Voice Authentication</h1>
            <p>Verify your identity using your unique voiceprint</p>
          </div>
          
          <VoiceInput onSuccess={() => router.push("/dashboard")} />
          
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
        
        <div className="floating-particles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="particle" style={{
              animationDelay: `${i * 2}s`,
              left: `${10 + (i * 15)}%`
            }} />
          ))}
        </div>
      </div>
    </>
  );
}