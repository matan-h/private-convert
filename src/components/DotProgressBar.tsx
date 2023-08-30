import React from 'react';

interface ProgressBarProps {
  progress: number;
  totalFiles: number;
}

const Dot: React.FC<{ active: boolean,done:boolean }> = ({ active,done}) => {
//   const dotClass = active ? 'dot active' : 'dot';
  const dotClass = active ? (done ? 'dot done' : 'dot active') : 'dot';
  return <div className={dotClass}></div>;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, totalFiles }) => {
  const dots = [];

  for (let i = 0; i < totalFiles; i++) {
    dots.push(<Dot key={i} active={i < progress} done={i+1<progress}  />);
  }

  return <div className="dot-progress-bar">{dots}</div>;
};

export default ProgressBar;
