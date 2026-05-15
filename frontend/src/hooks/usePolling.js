import { useState, useEffect, useRef } from 'react';
import { pptService } from '../services/api';

export const usePolling = (jobId, interval = 3000) => {
  const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!jobId) {
      setStatus('idle');
      setProgress(0);
      setResult(null);
      setError(null);
      return;
    }

    const poll = async () => {
      try {
        const data = await pptService.getStatus(jobId);
        
        setStatus(data.status);
        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          const finalResult = await pptService.getResult(jobId);
          setResult(finalResult);
          
          if (Notification.permission === 'granted') {
            new Notification('Presentation Ready!', {
              body: 'Your AI-powered slides have been generated successfully.',
              icon: '/favicon.ico'
            });
          }
          
          stopPolling();
        } else if (data.status === 'failed') {
          setError(data.error || 'Generation failed');
          
          if (Notification.permission === 'granted') {
            new Notification('Generation Failed', {
              body: 'There was an error generating your presentation.',
            });
          }
          
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
