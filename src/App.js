import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer Hello World du backend
  const fetchHelloWorld = async () => {
    try {
      const response = await fetch('http://localhost:8080');
      const text = await response.text();
      setMessage(text);
    } catch (error) {
      console.error('Error fetching from backend:', error);
      setMessage('Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // Charger le message au démarrage
  useEffect(() => {
    fetchHelloWorld();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>FindPath Project</h1>
        <p>Frontend: React</p>
        <p>Backend: C++ Server</p>
        
        <div className="hello-box">
          <h2>Backend Response:</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="message">
              {message}
            </div>
          )}
        </div>

        <button onClick={fetchHelloWorld} className="refresh-btn">
          Refresh
        </button>
      </header>
    </div>
  );
}

export default App;