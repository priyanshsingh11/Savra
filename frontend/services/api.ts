import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface JobRequest {
  topic: string;
  grade: string;
  num_slides: number;
}

export const jobApi = {
  createJob: async (request: JobRequest) => {
    const response = await axios.post(`${API_BASE_URL}/jobs`, request);
    return response.data; // { job_id: "..." }
  },
  
  getJobStatus: async (jobId: string) => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
};
