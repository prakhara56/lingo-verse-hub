
import axios from 'axios';

// Configure the base URL for FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create an axios instance for FastAPI
export const fastApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization interceptor
fastApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example functions for API interactions
export const sendChatMessage = async (message: string, context?: string[]) => {
  try {
    const response = await fastApiClient.post('/api/chat', {
      message,
      context,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const generateStockAnalysis = async (stockId: string) => {
  try {
    const response = await fastApiClient.post('/api/stocks/analyze', {
      stock_id: stockId,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating stock analysis:', error);
    throw error;
  }
};

export const generateBlogPost = async (topic: string) => {
  try {
    const response = await fastApiClient.post('/api/blog/generate', {
      topic,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
};

export const generateNotesFromVideo = async (videoUrl: string) => {
  try {
    const response = await fastApiClient.post('/api/notes/from-video', {
      video_url: videoUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating notes from video:', error);
    throw error;
  }
};
