import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import './index.css'; // Import your index CSS file
export default function Home() {
  const router = useRouter();

  const goToLogin = () => router.push('/login');
  const goToRegister = () => router.push('/register');

  return (
    <div className="min-h-screen">
      {/* Logo positioned top right */}
      <div className="logo-container">
        <Image 
          src="/logo.png" // or "/logo.png"
          alt="Company Logo"
          width={120}
          height={40}
          className="logo"
        />
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Secure Voice Authentication</h1>
        <p className="auth-subtitle">Choose an option to continue</p>

        <div className="auth-buttons-container">
          <button
            onClick={goToLogin}
            className="auth-button login-button"
          >
            Login with Voice
          </button>
          <button
            onClick={goToRegister}
            className="auth-button register-button"
          >
            Register Your Voice
          </button>
        </div>
      </div>
    </div>
  );
}