import { useState } from 'react'
import Home from './pages/Home'
import Navbar from "./components/Navbar";
import StatsDashboard from "./components/StatsDashboard";
import HistoryPanel from "./components/HistoryPanel";

function App() {
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar 
        onToggleStats={() => setShowStats(!showStats)} 
        onToggleHistory={() => setShowHistory(!showHistory)}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showStats && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatsDashboard />
          </div>
        )}
        
        {showHistory ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HistoryPanel onSelect={() => setShowHistory(false)} />
          </div>
        ) : (
          <Home />
        )}
      </main>
    </div>
  )
}

export default App
