import React, { useState, useCallback, useEffect } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { Message } from './types';
import { aiService } from './lib/services/AIService';
import { vectorStore } from './lib/services/VectorStore';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let progressInterval: number;

    const initializeData = async () => {
      try {
        progressInterval = window.setInterval(() => {
          if (mounted) {
            setInitProgress(vectorStore.getInitializationProgress());
          }
        }, 100);

        await vectorStore.initializeWithData();
        
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize. Please refresh the page.');
        }
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isInitialized) {
      setError('System is still initializing. Please wait a moment.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await aiService.generateResponse(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {!isInitialized && !error && (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-full max-w-xs bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Initializing system...</span>
                    <span className="text-sm text-gray-500">{Math.round(initProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(initProgress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <ChatContainer messages={messages} isProcessing={isProcessing} />
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full">
        <ChatInput onSend={handleSendMessage} disabled={isProcessing || !isInitialized} />
      </footer>
    </div>
  );
}

export default App;