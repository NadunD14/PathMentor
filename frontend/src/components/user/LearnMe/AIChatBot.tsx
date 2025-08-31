'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { mockConversationHistory } from '@/lib/mockData';

interface AIChatBotProps {
    initialPrompt?: string; // optional seed prompt (e.g., explain resource)
    learningContext?: string; // contextual prefix built from current learning path
}

export default function AIChatBot({ initialPrompt = '', learningContext = '' }: AIChatBotProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(() => {
        const base = mockConversationHistory[0].messages;
        if (initialPrompt) {
            // Insert a synthetic user prompt plus placeholder AI response (loading state replaced later)
            return [
                ...base,
                {
                    id: 'seed-user',
                    content: initialPrompt,
                    sender: 'user' as const,
                    timestamp: new Date().toISOString(),
                },
                {
                    id: 'seed-ai-pending',
                    content: 'Generating explanation...',
                    sender: 'ai' as const,
                    timestamp: new Date().toISOString(),
                }
            ];
        }
        return base;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Replace the placeholder AI message if we seeded an initial prompt
    useEffect(() => {
        if (initialPrompt && messages.find(m => m.id === 'seed-ai-pending')) {
            // Simulate async fetch for initial prompt explanation
            const timer = setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === 'seed-ai-pending' ? {
                    ...m,
                    id: 'seed-ai',
                    content: `Here's an explanation based on your resource request.\n\n${initialPrompt}\n\n(Key points and practice task would be generated here.)`
                } : m));
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [initialPrompt, messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim() === '') return;

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: input,
            sender: 'user' as const,
            timestamp: new Date().toISOString(),
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');

        // Simulate AI response after a short delay
        setTimeout(() => {
            const enriched = `${learningContext || ''}${input}`;
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: `I'm your AI learning assistant. (Context applied). You asked: "${enriched}"`,
                sender: 'ai' as const,
                timestamp: new Date().toISOString(),
            };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
        }, 600);
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto max-h-[500px] mb-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 
                  ${message.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'}`
                                }
                            >
                                <p className="break-words">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your learning assistant..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </Card>
    );
}
