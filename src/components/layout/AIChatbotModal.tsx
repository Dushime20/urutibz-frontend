import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, User, Bot, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/http';
import { API_BASE_URL } from '../../pages/admin/service/config';

interface Product {
    id: string;
    title: string;
    display_price: number;
    average_rating: number;
    district: string;
    images: any[];
    score: number;
    reasons: string[];
}

interface Message {
    role: 'user' | 'bot';
    content: string;
    products?: Product[];
}

interface AIChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIChatbotModal: React.FC<AIChatbotModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            content: "Hello! I'm your AI Rental Assistant. Describe what you're looking for, and I'll find the best matches for you! (e.g., 'I need a camera in Kigali under 30k')"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/chatbot/query`, { message: userMessage });
            const { message, recommendations } = response.data.data;

            setMessages(prev => [...prev, {
                role: 'bot',
                content: message,
                products: recommendations
            }]);
        } catch (error: any) {
            console.error('Chatbot query failed:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "I'm sorry, I'm having trouble connecting to my brain right now.";
            setMessages(prev => [...prev, {
                role: 'bot',
                content: `Error: ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-teal-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">AI Rental Assistant</h2>
                            <p className="text-sm text-teal-100 italic">Matching you with the perfect rentals</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-950">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-teal-600'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                                </div>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {/* Recommendations */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            {msg.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                                                    onClick={() => {
                                                        navigate(`/it/${product.id}`);
                                                        onClose();
                                                    }}
                                                >
                                                    <div className="relative aspect-[4/3] bg-gray-200">
                                                        {/* Score Badge */}
                                                        <div className="absolute top-2 right-2 z-10 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                            {product.score}% Match
                                                        </div>
                                                        <img
                                                            src={product.images?.[0]?.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{product.title}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="truncate">{product.district || 'Anywhere'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-black dark:text-teal-400 font-bold">
                                                                {product.display_price} RWF
                                                                <span className="text-xs font-normal text-gray-500"> /day</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                                                                <Star className="w-4 h-4 fill-current" />
                                                                {product.average_rating || 0}
                                                            </div>
                                                        </div>

                                                        {/* Reasoning */}
                                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                            <div className="flex flex-wrap gap-1">
                                                                {product.reasons.slice(0, 2).map((reason, idx) => (
                                                                    <span key={idx} className="bg-gray-50 dark:bg-teal-900/30 text-black dark:text-teal-300 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                                                        {reason}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none w-24 flex gap-1 justify-center items-center">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-4 pl-6 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="mt-3 flex justify-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                            Powered by Uruti AI
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatbotModal;
