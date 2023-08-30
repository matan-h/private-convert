import React from 'react';
import './LogsView.css'; // You can style this view as per your requirements

interface LogsViewProps {
  logs: string[];
  onClose: () => void;
}

const LogsView: React.FC<LogsViewProps> = ({ logs, onClose }) => {
  return (
    <div className="logs-view">
      <div className="logs-header">
        <h2>FFmpeg Logs</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="logs-content">
        <pre>
          {logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default LogsView;
