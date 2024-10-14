import React, { useState, useEffect } from 'react';
import { Book, Layers, Pen, HelpCircle } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import TutorPage from './tutor';
import FlashCardPage from './flashcard';
import QuizPage from './quiz';
import WriterPage from './writer';
import './App.css';

const TutorOption = ({ icon, title, description, link }) => {
  const navigate = useNavigate();
  const [isZooming, setIsZooming] = useState(false);

  const handleClick = () => {
    setIsZooming(true);
    setTimeout(() => navigate(link), 300); 
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #1f1f1f, #333)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
        transform: isZooming ? 'scale(1.1)' : 'scale(1)', // Zoom effect on click
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        textAlign: 'center',
        color: '#ffffff',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 12px 18px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isZooming ? 'scale(1.1)' : 'scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.3)';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#cccccc', marginBottom: '15px' }}>{description}</p>
      <Link to={link} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>
        Get Started
      </Link>
    </div>
  );
};

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

const GenAITutorHomepage = () => {
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setShowTitle(true);
  }, []);

  const options = [
    {
      icon: <Book style={{ width: '32px', height: '32px', color: '#00d4ff' }} />,
      title: "Personal Tutor",
      description: "Your ultimate academic companion. Ask general questions, unravel complex concepts, solve and understand difficult questions.",
      link: "/tutor",
    },
    {
      icon: <Layers style={{ width: '32px', height: '32px', color: '#5cf591' }} />,
      title: "Flash Card",
      description: "Master lecture material effortlessly. Get detailed insights while ensuring you grasp the essentials.",
      link: "/flashcards",
    },
    {
      icon: <Pen style={{ width: '32px', height: '32px', color: '#ff85e1' }} />,
      title: "Writer",
      description: "Get help with essays, reports, and creative writing tasks. Your personal AI writer awaits.",
      link: "/writer",
    },
    {
      icon: <HelpCircle style={{ width: '32px', height: '32px', color: '#ff6b6b' }} />,
      title: "Quiz",
      description: "Test your knowledge with custom quizzes. Perfect for exam prep and retention checks.",
      link: "/quiz",
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', opacity: showTitle ? 1 : 0, transform: `translateY(${showTitle ? '0' : '-20px'})`, transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out' }}>
        Welcome!
      </h1>
      <p style={{ color: '#cccccc', fontSize: '1rem', marginBottom: '25px' }}>
        Choose a section below and start studying.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: '50px', columnGap: '80px', width: '100%', maxWidth: '900px', padding: '20px' }}>
        {options.map((option, index) => (
          <TutorOption key={index} {...option} />
        ))}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GenAITutorHomepage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/writer" element={<WriterPage />} />
        <Route path="/flashcards" element={<FlashCardPage />} />
      </Routes>
    </Router>
  );
};

export default App;
