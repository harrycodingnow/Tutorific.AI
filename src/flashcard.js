import React, { useState, useEffect } from 'react';
import { AiOutlineUpload } from 'react-icons/ai'; 
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

const FlashCardPage = () => {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState([]);
  const [userFlashcards, setUserFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setShowTitle(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            {
              role: "system",
              content: `You are a helpful tutor specialized in ${topic}. Generate flashcards for this topic in JSON format. Each flashcard should contain a "question" and an "answer". Structure it like this:

[
  {
    "question": "Question 1",
    "answer": "Answer 1"
  },
  {
    "question": "Question 2",
    "answer": "Answer 2"
  }
]

Please generate several flashcards covering key concepts of ${topic}.`
            }
          ]
        })
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(`API request failed: ${result.status} ${result.statusText}\n${JSON.stringify(errorData)}`);
      }

      const data = await result.json();
      const flashcards = JSON.parse(data.choices[0].message.content);
      setResponse(flashcards);
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
      setResponse([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        try {
          const jsonFlashcards = JSON.parse(text);

          if (Array.isArray(jsonFlashcards) && jsonFlashcards.every(flashcard => flashcard.question && flashcard.answer)) {
            setUserFlashcards(jsonFlashcards);
            setError(null);
          } else {
            throw new Error('Invalid JSON structure');
          }
        } catch (jsonError) {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const flashcards = [];

          for (let i = 0; i < lines.length; i += 2) {
            const question = lines[i];
            const answer = lines[i + 1] || "No answer provided";
            flashcards.push({ question, answer });
          }

          setUserFlashcards(flashcards);
          setError(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearFlashcards = () => {
    setResponse([]);
    setUserFlashcards([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
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
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 'bold',
          opacity: showTitle ? 1 : 0,
          transform: `translateY(${showTitle ? '0' : '-20px'})`,
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
        }}>
          Flash Card Generator
        </h1>
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
          >
            {isLoading ? 'Loading...' : 'Generate Flash Cards'}
          </button>
        </form>

        <label htmlFor="file-upload" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
          padding: '12px',
          border: '2px dashed #007bff',
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#007bff',
          transition: 'all 0.3s ease-in-out',
        }}>
          <AiOutlineUpload size={20} style={{ marginRight: '8px' }} />
          <span>Upload Flashcards File (.txt or .json)</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt,.json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={clearFlashcards} 
          style={{
            marginTop: '20px',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Clear All Flash Cards
        </button>
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px', 
        padding: '10px', 
        width: '100%',
        maxWidth: '800px',
      }}>
        {response.map((flashcard, index) => (
          <FlashCard key={index} question={flashcard.question} answer={flashcard.answer} />
        ))}
        {userFlashcards.map((flashcard, index) => (
          <FlashCard key={`user-${index}`} question={flashcard.question} answer={flashcard.answer} />
        ))}
      </div>
    </div>
  );
};

const FlashCard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        padding: '20px',
        backgroundColor: '#2e2e2e',
        color: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        perspective: '1000px',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100px',
        textAlign: 'center',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
        }}>
          {question}
        </div>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          transform: 'rotateY(180deg)',
        }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FlashCardPage;
