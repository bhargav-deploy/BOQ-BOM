"use client";

import { useState, useRef, useEffect } from "react";
import { processMessage } from "@/app/actions/chat";
import { Send, MessageSquare, Bot, Trash2 } from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

type Message = {
    id: number;
    role: "user" | "bot";
    text: string;
    timestamp: Date | string; // Dates become strings in JSON/localStorage
};

const INITIAL_MESSAGE: Message = {
    id: 1,
    role: "bot",
    text: "Hello! 👋 I'm your Sales Assistant.\n\nI can help you check prices, find products, or contact support.\n\nTry asking: \"Price of Cisco Switch\" or \"Contact Support\"",
    timestamp: new Date()
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Mounting for Hydration safety
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load from LocalStorage on mount
    useEffect(() => {
        if (!isMounted) return; // Wait for mount
        const saved = localStorage.getItem("chat_history");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMessages(parsed);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
        setIsLoaded(true); // Mark as loaded even if empty
    }, [isMounted]);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return; // Don't save until loaded
        if (messages.length > 0) {
            localStorage.setItem("chat_history", JSON.stringify(messages));
        }
    }, [messages, isLoaded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleClearChat = () => {
        if (confirm("Clear chat history?")) {
            setMessages([INITIAL_MESSAGE]);
            localStorage.removeItem("chat_history");
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        try {
            const responseText = await processMessage(userMsg.text);
            const botMsg: Message = {
                id: Date.now() + 1,
                role: "bot",
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Date.now() + 1,
                role: "bot",
                text: "Sorry, I encountered an error checking the database.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    const quickActions = [
        "Price of Cisco Switch",
        "Stock of Cat6 Cable",
        "Contact Support",
        "Find Access Points"
    ];

    return (
        <div className="flex gap-6 h-[calc(100vh-100px)]">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg shadow-indigo-500/10 overflow-hidden glass">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Support Chat</h1>
                            <p className="text-indigo-500 text-xs font-medium">AI Sales Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear History"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
                    {!isMounted ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-400 text-sm animate-pulse">Initializing assistant...</div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={clsx(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}>
                                <div className={clsx(
                                    "max-w-[85%] rounded-2xl p-4 shadow-sm relative",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-tr-sm"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                                )}>
                                    {msg.role === "bot" && (
                                        <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> Assistant
                                        </div>
                                    )}

                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {msg.text}
                                    </div>

                                    <div className={clsx(
                                        "text-[10px] mt-2 select-none text-right",
                                        msg.role === "user" ? "text-indigo-200" : "text-gray-400"
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isThinking && (
                        <div className="flex w-full justify-start animate-fade-in">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSend} className="flex gap-3 w-full">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message... (e.g. 'Price of Switch')"
                            className="flex-1 rounded-xl border-gray-200 bg-gray-50 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none hover:translate-y-[-1px]"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side Panel */}
            <div className="w-80 hidden lg:flex flex-col gap-6">
                {/* Quick Actions Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-indigo-100 p-1 rounded text-indigo-600">⚡</span> Quick Actions
                    </h3>
                    <div className="space-y-2">
                        {quickActions.map(action => (
                            <button
                                key={action}
                                onClick={() => {
                                    setInput(action);
                                    // Optional: auto-focus input
                                }}
                                className="w-full text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-100"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 text-white shadow-md">
                    <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
                    <ul className="text-sm space-y-3 text-indigo-100">
                        <li className="flex gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Use <strong>Part Codes</strong> for exact pricing.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Ask for <strong>Stock</strong> to check availability.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Type <strong>"Help"</strong> to contact a human agent.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
