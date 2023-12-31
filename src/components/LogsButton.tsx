import React, { MouseEventHandler } from 'react';
import './LogsButton.css'; // You can style this button as per your requirements
interface StickyButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const StickyButton: React.FC<StickyButtonProps> = ({ onClick }) => {
  return (
    <button className="sticky-button" onClick={onClick}>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M47 4H15a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM15 21.414l5-5L25.586 22H15zM28.414 22l-3-3L31 13.414 39.586 22zM47 22h-4.586L31.707 11.293a1 1 0 0 0-1.414 0L24 17.586l-3.293-3.293a1 1 0 0 0-1.414 0L15 18.586V6h32z' style='fill:%2328282b'/%3E%3Cpath d='M41 16a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2zM48 26H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 30H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 34H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 38H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 42H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 46H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2zM48 50H14a1 1 0 0 0 0 2h34a1 1 0 0 0 0-2z' style='fill:%2328282b'/%3E%3Cpath d='M57 0H15a6.006 6.006 0 0 0-6 6v48H2a1 1 0 0 0-1 1v3a6.006 6.006 0 0 0 6 6h40a6.006 6.006 0 0 0 6-6V7h9a1 1 0 0 0 1-1 6.006 6.006 0 0 0-6-6zM7 62a4 4 0 0 1-4-4v-2h38v2a6.05 6.05 0 0 0 1.532 4zm44-4a4 4 0 0 1-8 0v-3a1 1 0 0 0-1-1H11V6a4 4 0 0 1 4-4h37.532A6.067 6.067 0 0 0 51 6zm2.142-53a3.991 3.991 0 0 1 7.732 0z' style='fill:%2328282b'/%3E%3C/svg%3E" alt="Logs"></img>
      {/* <img src="/images/logs-icon.svg" alt="Logs" />  */}
      Logs
    </button>
  );
};

export default StickyButton;
