import { useState } from 'react'
import './App.css'


const API_URL = import.meta.env.VITE_API_URL;

interface Source {
  label: string;
  url: string | null;
}

interface SummaryResult {
  summary: string[];
  sources: Source[];
}

function App() {
  const [url, setUrl] = useState<string>('');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


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
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }


  
  return (
    <>
    <div className="Title">
      <h1>Web Page Summarizer</h1>

      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL here" />
      <button onClick={summarize} disabled={loading}>
      {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p className="Error">{error}</p>}

    </div>

    {result && (
      <div className="Result">
        <h2>Summary</h2>
        <ul>
          {result.summary.map((point, i) => <li key={i}>{point}</li>)}
        </ul>

        <h2>Sources</h2>
        {result.sources.length === 0 ? (
          <p>No sources found.</p>
        ) : (
          <ul>
            {result.sources.map((source, i) => <li key={i}>
                {source.url ? (<a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>) : (<span>{source.label}</span>)}
            </li>)}
          </ul>
        )}
      </div>
    )}
    </>
  );
}

export default App
