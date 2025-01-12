import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatBotProps {
  onContextUpdate: (baihuawen: string[], originalText: string[]) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onContextUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 23422' // Replace with actual token
        },
        body: JSON.stringify({ query: input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let botResponse = '';
      setMessages(prev => [...prev, { type: 'bot', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          try {
            const jsonStr = line.slice(5); // Remove 'data: ' prefix
            const parsedData = JSON.parse(jsonStr);

            if (parsedData.event === 'cmpl' && typeof parsedData.text === 'string') {
              botResponse += parsedData.text;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = botResponse;
                return newMessages;
              });
            } else if (parsedData.event === 'cmpl' && typeof parsedData.text === 'object') {
              // Handle context update
              if (parsedData.text.baihuawen && parsedData.text.original_text) {
                onContextUpdate(parsedData.text.baihuawen, parsedData.text.original_text);
              }
            }
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError, 'for line:', line);
            continue;
          }
        }
      }

      if (!botResponse) {
        throw new Error('No valid response received from the server');
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'bot', content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;

