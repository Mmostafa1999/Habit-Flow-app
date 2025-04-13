"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import PageTransition from '@/components/common/PageTransition';
import { getHabits } from '@/lib/firebase/habits';
import { useAuth } from '@/lib/context/AuthContext';
import { Habit } from '@/types/habit';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [habitsLoading, setHabitsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    // Fetch user's actual habits from the database
    useEffect(() => {
        const fetchHabits = async () => {
            if (!user) return;

            try {
                setHabitsLoading(true);
                const userHabits = await getHabits(user.uid);
                setHabits(userHabits);
            } catch (error) {
                console.error('Error fetching habits:', error);
            } finally {
                setHabitsLoading(false);
            }
        };

        fetchHabits();
    }, [user]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message to chat
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Format habits for the AI
            const habitDescriptions = habits.map(habit =>
                `${habit.name}${habit.frequency ? ` (${habit.frequency})` : ''}`
            );

            // Make API call to our chat endpoint
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    habits: habitDescriptions,
                }),
            });

            // Add empty assistant message that we'll update
            setMessages(prev => [...prev, { role: 'assistant' as const, content: '' }]);

            if (!response.ok) {
                try {
                    // Try to parse the error response as JSON
                    const errorData = await response.json();
                    console.error("API Error:", errorData, "Status:", response.status);

                    // Update the assistant message with the error
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                            role: 'assistant' as const,
                            content: `Error: ${errorData.error || errorData.message || 'Unknown error'}. Please check your API configuration.`
                        }
                    ]);
                } catch (parseError) {
                    // If can't parse as JSON, display status code
                    console.error("Failed to parse error response:", parseError);
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                            role: 'assistant' as const,
                            content: `Sorry, there was an error (Status: ${response.status}). Please check the console for details.`
                        }
                    ]);
                }
                return;
            }

            // Try to handle as a streaming response first
            if (response.body) {
                try {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let responseText = '';

                    // Stream the response
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // Decode and append to our response text
                        const chunk = decoder.decode(value, { stream: true });
                        responseText += chunk;

                        // Update the assistant's message with the current text
                        setMessages(prev => [
                            ...prev.slice(0, -1),
                            { role: 'assistant' as const, content: responseText }
                        ]);
                    }
                } catch (streamError) {
                    // If streaming fails, try to get the full text at once
                    console.error("Streaming failed, fallback to text:", streamError);
                    const fullText = await response.text();
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        { role: 'assistant' as const, content: fullText || "Sorry, I couldn't process your request properly." }
                    ]);
                }
            } else {
                // Fallback for when response.body is null
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    { role: 'assistant' as const, content: "Sorry, I couldn't process your request. The response was empty." }
                ]);
            }
        } catch (error) {
            console.error('Error getting chat response:', error);
            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant' as const,
                    content: `Sorry, I had trouble responding. The error was: ${error instanceof Error ? error.message : String(error)}`
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Format the habit information to display in the sidebar
    const formatHabitInfo = (habit: Habit) => {
        let info = habit.name;
        if (habit.frequency) {
            info += ` (${habit.frequency})`;
        }
        return info;
    };

    return (
        <PageTransition>
            <div className="container mx-auto max-w-4xl px-4 py-6">
                <div className="bg-white shadow-md rounded-lg p-4 h-[calc(100vh-16rem)] flex flex-col">
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">
                                <p className="text-lg mb-2">Welcome to your AI Assistant!</p>
                                <p>Ask me anything about your habits or how I can help you improve them.</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center border-t pt-4"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 rounded-l-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className={`rounded-r-lg bg-blue-500 p-2 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                                }`}
                            disabled={isLoading}
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>

             
            </div>
        </PageTransition>
    );
} 