import { useState, useEffect, useRef } from 'react';
import { pptService } from '../services/api';

export const usePolling = (jobId, interval = 3000) => {
  const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const data = await pptService.getStatus(jobId);
        
        setStatus(data.status);
        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          const finalResult = await pptService.getResult(jobId);
          setResult(finalResult);
          stopPolling();
        } else if (data.status === 'failed') {
          setError(data.error || 'Generation failed');
          stopPolling();
        }
      } catch (err) {
        setError('Connection error while polling');
        stopPolling();
      }
    };

    const startPolling = () => {
      setStatus('processing');
      timerRef.current = setInterval(poll, interval);
      poll(); // Initial check
    };

    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    startPolling();

    return () => stopPolling();
  }, [jobId, interval]);

  return { status, progress, result, error };
};
