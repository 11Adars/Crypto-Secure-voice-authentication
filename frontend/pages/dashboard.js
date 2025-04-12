import './dashboard.css';
import { useState, useEffect } from 'react';
import axios from '../utils/api';

export default function Dashboard() {
  const [fileContent, setFileContent] = useState('');
  const [alert, setAlert] = useState('');
  const [logs, setLogs] = useState('');

  useEffect(() => {
    fetch('/confidential.txt')
      .then(res => res.text())
      .then(setFileContent)
      .catch(() => setFileContent('⚠️ Failed to load confidential file.'));
  }, []);

  const handleThreatAttempt = async (action) => {
    try {
      await axios.post('/files/monitor', { action });
      setAlert(`🚨 Unauthorized attempt detected: ${action}`);
    } catch (err) {
      setAlert('⚠️ Threat attempt detected but logging failed.');
    }
  };

  const handleGetLogs = async () => {
    try {
      const res = await axios.get('/files/logs');
      setLogs(res.data.summary);
    } catch (err) {
      setLogs('⚠️ No logs found.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1 className="dashboard-title">🔐 Secure Access Dashboard</h1>

        <section>
          <h2 className="section-title">📁 Confidential File</h2>
          <textarea
            readOnly
            value={fileContent}
            onCopy={(e) => {
              e.preventDefault();
              handleThreatAttempt('Copy attempt');
            }}
            onCut={(e) => {
              e.preventDefault();
              handleThreatAttempt('Cut attempt');
            }}
            onPaste={(e) => {
              e.preventDefault();
              handleThreatAttempt('Paste attempt');
            }}
            onKeyDown={(e) => {
              if (['Backspace', 'Delete'].includes(e.key)) {
                e.preventDefault();
                handleThreatAttempt('Delete key attempt');
              }
            }}
            className="confidential-textarea"
          />
          {alert && <p className="alert-box">{alert}</p>}
        </section>

        <button onClick={handleGetLogs} className="primary-button">
          📜 Show Log Summary
        </button>

        {logs && <div className="logs-box"><pre>{logs}</pre></div>}
      </div>
    </div>
  );
}
