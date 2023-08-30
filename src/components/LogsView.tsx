import React, { useEffect, useRef } from 'react';
import './LogsView.css'; // You can style this view as per your requirements

interface LogsViewProps {
  logs: string[];
  onClose: () => void;
}

const LogsView: React.FC<LogsViewProps> = ({ logs, onClose }) => {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Auto-scroll logs to the bottom when new logs are added
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="logs-view">
      <div className="logs-header">
        <h2>FFmpeg Logs</h2>
        <button className='close-button' onClick={onClose}>Close</button>
      </div>
      <div className="logs-content" ref={logsContainerRef}>
        <pre>
          {logs.map((log, index) => (
            <p key={index} className={(log==="Aborted()" && "ffend")||undefined}>{log}</p>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default LogsView;
