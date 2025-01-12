import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import ContextDisplay from './components/ContextDisplay';
import './App.css';

const App: React.FC = () => {
  const [baihuawenContext, setBaihuawenContext] = useState<string[]>([]);
  const [originalTextContext, setOriginalTextContext] = useState<string[]>([]);

  const handleContextUpdate = (baihuawen: string[], originalText: string[]) => {
    setBaihuawenContext(baihuawen);
    setOriginalTextContext(originalText);
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <ChatBot onContextUpdate={handleContextUpdate} />
      </div>
      <div className="context-container">
        <ContextDisplay title="白话文上下文" content={baihuawenContext} />
        <ContextDisplay title="原文上下文" content={originalTextContext} />
      </div>
    </div>
  );
};

export default App;

