import React from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  isProcessing: boolean;
}

export function ChatContainer({ messages, isProcessing }: ChatContainerProps) {
  return (
    <div className="space-y-4 p-4">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isProcessing && (
        <div className="flex items-center gap-2 text-gray-500 p-4">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
          Processing...
        </div>
      )}
    </div>
  );
}