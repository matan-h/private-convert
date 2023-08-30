import React, { MouseEventHandler } from 'react';
import './StickyButton.css'; // You can style this button as per your requirements

interface StickyButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const StickyButton: React.FC<StickyButtonProps> = ({ onClick }) => {
  return (
    <button className="sticky-button" onClick={onClick}>
      <img src="/images/logs-icon.svg" alt="Logs" /> Logs
    </button>
  );
};

export default StickyButton;
