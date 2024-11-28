import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-4 rounded-lg ${isUser ? 'bg-white' : 'bg-purple-50'}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <div className="relative">
                  <pre {...props} className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto" />
                </div>
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code {...props} className="bg-gray-100 px-1 py-0.5 rounded" />
                ) : (
                  <code {...props} />
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}