import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';

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

const WriterPage = () => {
  const [mode, setMode] = useState('Writer');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
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
      const systemMessage = {
        'Writer': 'You are a helpful assistant who can generate well-written content.',
        'Paraphraser': 'You are a paraphraser who can rewrite content in a different way.',
        'Grammar Checker': 'You are a grammar checker who can correct and improve text.',
        'Humanize AI': 'You are an assistant specialized in transforming AI-generated text to make it sound more natural and human-like.',
      }[mode] || 'You are a helpful assistant.';

      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: question }
          ]
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}\n${JSON.stringify(errorData)}`);
      }

      const data = await apiResponse.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  const highlightChanges = (originalText, modifiedText, type) => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(originalText, modifiedText);
    dmp.diff_cleanupSemantic(diffs);

    return diffs.map(([diffType, text], index) => {
      if (type === 'original' && diffType === -1) {
        return (
          <span
            key={index}
            style={{
              textDecoration: 'line-through',
              backgroundColor: '#ffcccb',
              color: '#000000',
              padding: '2px',
              borderRadius: '3px',
            }}
          >
            {text}
          </span>
        );
      } else if (type === 'modified' && diffType === 1) {
        return (
          <span
            key={index}
            style={{
              backgroundColor: '#ffeb3b',
              color: '#000000',
              padding: '2px',
              borderRadius: '3px',
            }}
          >
            {text}
          </span>
        );
      }
      return <span key={index}>{text}</span>;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    alert("Modified text copied to clipboard!");
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
          Writer Generator
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          >
            <option value="Writer">Writer</option>
            <option value="Paraphraser">Paraphraser</option>
            <option value="Grammar Checker">Grammar Checker</option>
            <option value="Humanize AI">Humanize AI</option>
          </select>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your content"
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
              minHeight: '100px',
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
            {isLoading ? 'Loading...' : 'Generate Content'}
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
        {response && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            textAlign: mode === 'Writer' ? 'left' : 'center',
            backgroundColor: '#1e2f2f',
            borderRadius: '8px',
            color: '#a1ecff',
          }}>
            {mode === 'Writer' ? (
              <>
                <h3>Generated Text</h3>
                <p>{response}</p>
              </>
            ) : (
              <>
                <div style={{
                  marginBottom: '10px',
                  padding: '15px',
                  backgroundColor: '#2e2e2e',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}>
                  <h3>Original Text (With Changes Highlighted)</h3>
                  <p>{highlightChanges(question, response, 'original')}</p>
                </div>
                <div style={{
                  marginBottom: '10px',
                  padding: '15px',
                  backgroundColor: '#1e2f2f',
                  borderRadius: '8px',
                  color: '#a1ecff',
                }}>
                  <h3>Modified Text</h3>
                  <p>{highlightChanges(question, response, 'modified')}</p>
                  <button onClick={copyToClipboard} style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}>
                    Copy Modified Text
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WriterPage;
