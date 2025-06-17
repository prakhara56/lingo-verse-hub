
import axios from 'axios';

// Configure the base URL for FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create an axios instance for FastAPI
export const fastApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add authorization interceptor
fastApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
fastApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The server is taking too long to respond.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.status === 404) {
      error.message = 'API endpoint not found. Please check the server configuration.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    return Promise.reject(error);
  }
);

// Example functions for API interactions
export const sendChatMessage = async (message: string, context?: string[]) => {
  try {
    const response = await fastApiClient.post('/api/v1/chatbot/chat', {
      message,
      history: context || [],
      uploaded_files: [],
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

// UI Testing API functions
export const generateTestCases = async (userStory: string, context?: string) => {
  try {
    const response = await fastApiClient.post('/api/v1/ui_testing/test_case_generation', {
      user_story_input: userStory,
      additional_context_via_file_upload: '',
      additional_context_via_text_input: context || '',
      user_context_uploaded: false,
      rag_enabled: 'N'
    });
    return response.data;
  } catch (error) {
    console.error('Error generating test cases:', error);
    throw error;
  }
};

export const generateTestScript = async (testCase: string, framework: 'playwright' | 'selenium' = 'playwright') => {
  try {
    const response = await fastApiClient.post('/api/v1/ui_testing/prompt_test_script_generation', {
      testcase: testCase,
      testcase_from_file_upload: '',
      uploaded_file: false,
      framework
    });
    return response.data;
  } catch (error) {
    console.error('Error generating test script:', error);
    throw error;
  }
};

// User Story Enhancement API functions
export const analyzeUserStory = async (userStory: string) => {
  try {
    const response = await fastApiClient.post('/api/v1/user_story_enhancer/run_analysis', {
      user_story: userStory
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing user story:', error);
    throw error;
  }
};

export const enhanceUserStory = async (
  originalStory: string, 
  enhancementAnswers: any, 
  suggestions: string[], 
  oldScore: number
) => {
  try {
    const response = await fastApiClient.post('/api/v1/user_story_enhancer/enhance_user_story', {
      original_user_story: originalStory,
      enhancement_answers: enhancementAnswers,
      suggestions,
      old_user_story_score: oldScore,
      uploaded_document_path: null,
      user_context_from_textbox: null
    });
    return response.data;
  } catch (error) {
    console.error('Error enhancing user story:', error);
    throw error;
  }
};
