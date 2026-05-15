import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pptService = {
  /**
   * Submit a new PPT generation job
   */
  generatePPT: async (data) => {
    const response = await apiClient.post('/generate', data);
    return response.data; // { job_id: "..." }
  },

  /**
   * Get current status of a job
   */
  getStatus: async (jobId) => {
    const response = await apiClient.get(`/status/${jobId}`);
    return response.data; // { status, progress, ... }
  },

  /**
   * Get final generated result
   */
  getResult: async (jobId) => {
    const response = await apiClient.get(`/result/${jobId}`);
    return response.data; // { slides: [...] }
  },
};
