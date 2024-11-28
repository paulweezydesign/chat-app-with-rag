import React from 'react';
import { Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Brain className="w-8 h-8 text-purple-500" />
        <h1 className="text-xl font-bold">AI Code Assistant</h1>
      </div>
    </header>
  );
}