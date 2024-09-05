import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../../consts';
import { getHeaders } from '../../../utils';
import DOMPurify from 'dompurify';

export function Chatbot() {
  const token = localStorage.getItem('token') || '';
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any>([]);

  const getBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}`;
  };

  const replacePlaceholders = (message: string, url: string) => {
    return message.replace(/FRONTEND_URL/g, url);
  };

  const baseUrl = getBaseUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatHistory([...chatHistory, { type: 'user', content: userMessage }]);

    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        message: userMessage
      }, getHeaders(token));

      setChatHistory(prev => [...prev, { type: 'bot', content: response.data.botMessage }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div 
          key={index} 
          className={`message ${msg.type}`}
          // Use `dangerouslySetInnerHTML` to render the message content with HTML
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(replacePlaceholders(msg.content, baseUrl)) }}
          >
            {/* {msg.content} */}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}