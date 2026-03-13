import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testConnection = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const err = error as { response?: { status: number }; message?: string };
    if (error.response?.status === 401) {
      // It's expected to be 401 if we don't send auth token, 
      // but it validates the server is up and returning valid HTTP responses!
      return { success: true, message: 'Server reached (401 Unauthorized - Expected)' };
    }
    return { success: false, error: err.message || 'Unknown error' };
  }
};
