// pages/login.js
import VoiceInput from "../components/VoiceInput";
import { useRouter } from "next/router";
import "./login.css"; // Import your global CSS file

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <VoiceInput onSuccess={() => router.push("/dashboard")} />
      </div>
    </div>
  );
}
