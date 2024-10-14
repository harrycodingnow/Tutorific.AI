import React, { useState, useEffect } from 'react';

const QuizPage = () => {
  const [topic, setTopic] = useState('');
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTitle, setShowTitle] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState('Multiple Choice');

  useEffect(() => {
    setShowTitle(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowResults(false);
  
    const typeInstructions = {
      'Multiple Choice': `multiple-choice questions with several options`,
      'True/False': `true or false questions with options "True" and "False"`,
      'Short Answer': `short answer questions without options`,
      'Mixed': `a mix of multiple-choice, true/false, and short answer questions`,
    };
  
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
              content: `You are a helpful tutor specialized in ${topic}. Generate ${numQuestions} ${typeInstructions[questionType]} on this topic in JSON format. Each question should have a "question" and "correct_answer". For "Multiple Choice" and "True/False", include an "options" array, but for "Short Answer", do not include any options. Here is the required format:
  
  [
    { 
      "question": "Sample question?", 
      "correct_answer": "Correct answer"
      ${questionType !== 'Short Answer' ? ',"options": ["Option 1", "Option 2", "Option 3", "Option 4"]' : ''}
    }
  ]
  `
            },
            { role: "user", content: `Please generate a quiz on ${topic}.` }
          ]
        })
      });
  
      if (!result.ok) {
        const errorData = await result.json();
        setError(`API request failed: ${result.status} ${result.statusText}`);
        throw new Error(`API request failed: ${result.status} ${result.statusText}`);
      }
  
      const data = await result.json();
      let generatedQA;
  
      try {
        generatedQA = JSON.parse(data.choices[0].message.content);
      } catch (jsonError) {
        setError("Failed to parse JSON response. Ensure the generated response is in JSON format.");
        throw new Error("Failed to parse JSON response. Ensure the generated response is in JSON format.");
      }
  
      setQuestionsAndAnswers(generatedQA.slice(0, numQuestions));
      setUserAnswers({});
    } catch (error) {
      console.error('Error:', error);
      setQuestionsAndAnswers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionSelect = (questionIndex, option) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: option
    }));
  };

  const calculateScore = () => {
    let newScore = 0;
    questionsAndAnswers.forEach((qa, index) => {
      if (userAnswers[index] === qa.correct_answer) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setShowResults(true);
  };

  const clearQuiz = () => {
    setTopic('');
    setQuestionsAndAnswers([]);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setError(null);
    setIsLoading(false);
    setNumQuestions(10);
    setQuestionType('Multiple Choice');
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
          Quiz Generator
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
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          >
            {[5, 10, 15, 20].map(num => (
              <option key={num} value={num}>{num} Questions</option>
            ))}
          </select>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          >
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="True/False">True/False</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Mixed">Mixed</option>
          </select>
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
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {isLoading ? 'Loading...' : 'Generate Quiz'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button 
            type="button"
            onClick={clearQuiz}
            style={{
              width: '20%',
              padding: '12px', 
              fontSize: '16px', 
              backgroundColor: '#d9534f', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              marginTop: '10px',

            }}
          >
            Clear Quiz
          </button>
          </div>
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
        {questionsAndAnswers.length > 0 && !showResults && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#1e2f2f',
            borderRadius: '8px',
            color: '#a1ecff',
            textAlign: 'left',
          }}>
            {questionsAndAnswers.map((qa, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <h3>Q{index + 1}: {qa.question}</h3>
                {questionType === 'Short Answer' ? (
                  <input
                    type="text"
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleOptionSelect(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #007bff',
                      backgroundColor: '#333',
                      color: '#ffffff',
                    }}
                    placeholder="Your answer"
                  />
                ) : (
                  qa.options && qa.options.map((option, optIndex) => (
                    <div key={optIndex}>
                      <label>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={userAnswers[index] === option}
                          onChange={() => handleOptionSelect(index, option)}
                          style={{ marginRight: '8px' }}
                        />
                        {option}
                      </label>
                    </div>
                  ))
                )}
              </div>
            ))}
            <button 
              onClick={calculateScore}
              style={{
                marginTop: '20px',
                padding: '10px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Submit Answers
            </button>
          </div>
        )}
        {showResults && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#1e2f2f',
            borderRadius: '8px',
            color: '#a1ecff',
            textAlign: 'left',
          }}>
            <h3>Results:</h3>
            <p>Your score: {score} / {numQuestions}</p>
            <h3>Answers:</h3>
            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
              {questionsAndAnswers.map((qa, index) => (
                <li key={index} style={{
                  marginBottom: '10px',
                  color: userAnswers[index] === qa.correct_answer ? '#28a745' : '#ff4d4d' 
                }}>
                  <strong>Q{index + 1}:</strong> {qa.question} <br />
                  <strong>Your Answer:</strong> {userAnswers[index] || 'No answer provided'} <br />
                  <strong>Correct Answer:</strong> {qa.correct_answer}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
