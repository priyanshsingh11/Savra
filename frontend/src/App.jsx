import { useState } from 'react'
import Home from './pages/Home'
import Navbar from "./components/Navbar";
import StatsDashboard from "./components/StatsDashboard";
import { BarChart3 } from "lucide-react";

function App() {
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar onToggleStats={() => setShowStats(!showStats)} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showStats && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StatsDashboard />
          </div>
        )}
        <Home />
      </main>
    </div>
  )
}

export default App
