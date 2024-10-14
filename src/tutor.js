import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header style={{
    position: 'absolute',
    top: '20px',
    left: '20px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  }}>
    <Link to="/" style={{ color: '#ffffff', textDecoration: 'none' }}>
      Tutorific.AI
    </Link>
  </header>
);

const TutorPage = () => {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setShowTitle(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return; 

    setChatHistory((prevChat) => [...prevChat, { role: "user", content: question }]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `You are a helpful tutor specialized in ${topic}.` },
            ...chatHistory.map(({ role, content }) => ({ role, content })), 
            { role: "user", content: question }
          ]
        })
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(`API request failed: ${result.status} ${result.statusText}\n${JSON.stringify(errorData)}`);
      }

      const data = await result.json();
      const assistantResponse = data.choices[0].message.content;

      setChatHistory((prevChat) => [...prevChat, { role: "assistant", content: assistantResponse }]);
      setQuestion(''); // Clear input field
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      padding: '20px',
    }}>
      <Header />
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'linear-gradient(135deg, #1f1f1f, #333)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 'bold',
          opacity: showTitle ? 1 : 0,
          transform: `translateY(${showTitle ? '0' : '-20px'})`,
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
        }}>
          Personal Tutor Chatbot
        </h1>
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '15px',
          backgroundColor: '#2e2e2e',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          {chatHistory.map((message, index) => (
            <div key={index} style={{ 
              textAlign: message.role === "user" ? 'right' : 'left', 
              marginBottom: '10px' 
            }}>
              <span style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: message.role === "user" ? '#007bff' : '#1e2f2f',
                color: message.role === "user" ? '#ffffff' : '#a1ecff',
                fontWeight: 'bold'
              }}>
                {message.content}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter study topic"
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '12px', 
              fontSize: '16px', 
              backgroundColor: isLoading ? '#555' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease-in-out',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isLoading ? 'Loading...' : 'Ask Tutor'}
          </button>
        </form>
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#ff4d4d',
            borderRadius: '8px',
            color: '#ffffff',
          }}>
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorPage;
