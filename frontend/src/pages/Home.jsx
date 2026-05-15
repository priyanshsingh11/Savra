import React, { useState } from 'react';
import PPTForm from '../components/PPTForm';
import LoadingState from '../components/LoadingState';
import ResultViewer from '../components/ResultViewer';
import StatusBadge from '../components/StatusBadge';
import { usePolling } from '../hooks/usePolling';
import { pptService } from '../services/api';
import { Sparkles, History } from 'lucide-react';

const Home = () => {
  const [jobId, setJobId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { status, progress, result, error } = usePolling(jobId);

  const handleGenerate = async (data) => {
    try {
      setIsSubmitting(true);
      setJobId(null); // Reset previous job
      const response = await pptService.generatePPT(data);
      setJobId(response.job_id);
    } catch (err) {
      alert('Failed to start generation. Please check your backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setJobId(null);
  };

  return (
    <div className="flex flex-col items-center">

      <div className="relative z-10 w-full flex flex-col items-center">
        {!jobId && !isSubmitting && (
          <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              Create presentations <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">in seconds, not hours.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Unlock professional, structured, and insightful PowerPoint content for any topic and grade level using advanced AI.
            </p>
          </div>
        )}

        <div className="w-full flex justify-center">
          {status === 'idle' && !isSubmitting && !jobId && (
            <PPTForm onSubmit={handleGenerate} isLoading={isSubmitting} />
          )}

          {(status === 'processing' || isSubmitting) && (
            <LoadingState progress={progress} />
          )}

          {status === 'completed' && result && (
            <ResultViewer result={result} onReset={handleReset} />
          )}

          {status === 'failed' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <History size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Generation Failed</h3>
              <p className="text-slate-500">{error || 'An unexpected error occurred during generation.'}</p>
              <button 
                onClick={handleReset}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {jobId && status !== 'idle' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/50 flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Current Status:</span>
            <StatusBadge status={status} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
