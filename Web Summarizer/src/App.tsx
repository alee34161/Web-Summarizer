import { useState } from 'react'
import './App.css'

/* TODO LIST:
  - History List
    - Store in user's browser local storage; no need to implement cookies/auth
    - Minimized button/links/title in a list
    - Can be expanded to see full summary and sources again
    Sorted by most recent by default
  - Search bar for history
    - Can search by URL or summary text
  - Delete history items/Delete all
*/


const API_URL = import.meta.env.VITE_API_URL;
const HISTORY_KEY = 'web_summarizer_history';

interface Source {
  label: string;
  url: string | null;
}

interface SummaryResult {
  summary: string[];
  sources: Source[];
}

interface HistoryItem {
  id: string;
  url: string;
  result: SummaryResult;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function App() {
  const [url, setUrl] = useState<string>('');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
    setHistory(updated);
  }

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
    setExpandedId(null);
  }


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

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        url,
        result: data,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...history];
      saveHistory(updated);
      setHistory(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter(item => {
    const searchLower = search.toLowerCase();
    if(!searchLower) return true;
    return item.url.toLowerCase().includes(searchLower) || item.result.summary.some(point => point.toLowerCase().includes(searchLower));
  });

  return (
    <>
    <div className="Title">
      <h1>Web Page Summarizer</h1>
    </div>

    <div className="Input">
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL here" />
      <button onClick={summarize} disabled={loading}>
      {loading ? "Summarizing..." : "Summarize"}
      </button>
    </div>
    {result && (
       <div>
         <button onClick={() => { setResult(null); setUrl(''); }}>Clear Summary</button>
      </div>
    )}

    {error && (
      <div className="Error">
        <p>{error}</p>
      </div>
    )}

    {result && (
      <div className="ResultsBlock">
        <div className="Result">
          <h2>Summary</h2>
          <ul>
            {result.summary.map((point, i) => <li key={i}>{point}</li>)}
          </ul>
        </div>
        <div className="Source">
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
      </div>
    )}

    <div className="Search">
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by URL or history..." />
    </div>

    <div className="History">
      <h2>History</h2>
      <button onClick={clearHistory}>Clear History</button>
      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        <ul>
          {filteredHistory.map((item) => (
            <li key={item.id}>
              <div className="HistoryHeader">
                <span>{item.url}</span>
                <span>, {new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <div className="HistoryButton">
                <button onClick={() => deleteHistoryItem(item.id)}>Delete</button>
                <button onClick={() => toggleExpand(item.id)}>{expandedId === item.id ? "Hide Details" : "Show Details"}</button>
              </div>
              {expandedId === item.id && (
                <div className="ResultsBlock">
                  <div className="Result">
                  <h2>Summary</h2>
                  <ul>
                    {item.result.summary.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                  </div>
                  <div className="Source">
                  <h2>Sources</h2>
                  <ul>
                    {item.result.sources.map((source, i) => <li key={i}>
                        {source.url ? (<a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>) : (<span>{source.label}</span>)}
                    </li>)}
                  </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="Footer">
      <p>This web app uses generative AI to summarize links and is meant to quickly parse data.</p>
      <p>Please verify accuracy of important information and sources before use.</p>
    </div>
    </>
  );
}

export default App
