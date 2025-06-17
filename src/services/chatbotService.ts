
import { fastApiClient } from '@/utils/apiHelpers';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  uploaded_files: string[];
}

export interface ChatResponse {
  response: string;
}

export const chatbotService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fastApiClient.post('/api/v1/chatbot/chat', request);
      return response.data;
    } catch (error: any) {
      console.error('Error sending message to chatbot:', error);
      
      // Handle specific error cases
      if (error.response?.status === 422) {
        throw new Error('Invalid message format. Please check your input.');
      } else if (error.response?.status === 500) {
        throw new Error('Chatbot service is currently unavailable. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw new Error('Failed to send message. Please try again.');
    }
  },

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('upload_file', file);

      const response = await fastApiClient.post('/api/v1/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.file_path || response.data.filename || file.name;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      if (error.response?.status === 413) {
        throw new Error('File is too large. Please upload a smaller file.');
      } else if (error.response?.status === 415) {
        throw new Error('File type not supported. Please upload a different file.');
      }
      
      throw new Error('Failed to upload file. Please try again.');
    }
  }
};
