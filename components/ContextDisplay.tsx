import React from 'react';
import './ContextDisplay.css';

interface ContextDisplayProps {
  title: string;
  content: string[];
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({ title, content }) => {
  return (
    <div className="context-display">
      <h2>{title}</h2>
      <div className="context-content">
        {content.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
    </div>
  );
};

export default ContextDisplay;

