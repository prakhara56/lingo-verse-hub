
import React from 'react';
import { MessageRenderer } from './MessageRenderer';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "code" | "audio";
  attachment?: string;
}

interface ChatMessageProps {
  message: Message;
  index: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  return (
    <div
      key={index}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <MessageRenderer content={message.content} role={message.role} />
        
        {message.type === "image" && message.attachment && (
          <div className="mt-3">
            <img 
              src={message.attachment} 
              alt="AI generated" 
              className="rounded-md max-w-full h-auto"
            />
          </div>
        )}
        
        <p className="text-xs opacity-70 mt-2 text-right">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
