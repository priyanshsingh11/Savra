import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePollJob = (jobId: string | null, interval = 2000) => {
  const [status, setStatus] = useState<string>('idle');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`);
        const result = response.data;

        setStatus(result.status);
        
        if (result.status === 'completed') {
          setData(result.data);
          return true; // Stop polling
        } else if (result.status === 'failed') {
          setError(result.error || 'Generation failed');
          return true; // Stop polling
        }
        return false; // Continue polling
      } catch (err) {
        setError('Connection error');
        return true;
      }
    };

    const timer = setInterval(async () => {
      const shouldStop = await poll();
      if (shouldStop) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [jobId, interval]);

  return { status, data, error };
};
