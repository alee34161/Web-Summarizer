import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'


const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [url setUrl] = useState('');
  const [result, setResult] = useState('null');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const summarize = async () => {
    if(!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    
  );
}

export default App
