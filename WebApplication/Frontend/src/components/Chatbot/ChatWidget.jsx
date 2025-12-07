import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am SHIELD, your SOC Assistant. Ask me about incidents, playbooks, or live data.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { message: userMsg });
            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Support unavailable. System error.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to RAG Brain.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center gap-2"
            >
                <Bot size={24} />
                <span className="font-bold hidden md:inline">AI Assistant</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">SHIELD Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-slate-400">Online • RAG Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        <Minimize2 size={18} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-3 flex gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about incidents or playbooks..."
                        className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                    AI can make mistakes. Verify critical actions.
                </p>
            </form>
        </div>
    );
};

export default ChatWidget;
