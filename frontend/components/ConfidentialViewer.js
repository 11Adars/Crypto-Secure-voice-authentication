// components/ConfidentialViewer.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ConfidentialViewer() {
  const [content, setContent] = useState("");
  const [threat, setThreat] = useState("");

  useEffect(() => {
    fetch("/confidential.txt")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  const handleUnauthorizedAction = async () => {
    // Notify backend to log threat
    try {
      const res = await fetch("http://localhost:5000/api/files/monitor", {
        method: "POST",
      });

      const result = await res.json();
      if (res.ok) {
        setThreat("⚠️ Unauthorized action detected and blocked.");
      } else {
        setThreat("⚠️ Failed to notify backend.");
      }
    } catch (err) {
      setThreat("⚠️ Error contacting backend.");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Confidential File</h2>
      <textarea
        readOnly
        value={content}
        onCopy={(e) => {
          e.preventDefault();
          handleUnauthorizedAction();
        }}
        onCut={(e) => {
          e.preventDefault();
          handleUnauthorizedAction();
        }}
        onPaste={(e) => {
          e.preventDefault();
          handleUnauthorizedAction();
        }}
        onKeyDown={(e) => {
          if (["Backspace", "Delete"].includes(e.key)) {
            e.preventDefault();
            handleUnauthorizedAction();
          }
        }}
        className="w-full h-48 border rounded p-2 text-sm"
      />
      {threat && <p className="text-red-600 mt-3">{threat}</p>}
    </div>
  );
}
