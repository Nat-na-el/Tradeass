import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

export default function MentorMode() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "mentor",
      content: "Welcome to Mentor Mode. I'm your virtual trading coach.\n\nTell me about your last trade or ask any question — psychology, risk management, strategy review...",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      sender: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate mentor reply (you can replace with real AI later)
    setTimeout(() => {
      let reply = "";

      if (input.toLowerCase().includes("last trade") || input.toLowerCase().includes("review")) {
        reply =
          "Let's review your last trade.\n• What was the setup?\n• Did you follow your rules?\n• What emotion influenced you most?\n\nShare more details so I can give specific feedback.";
      } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("stop")) {
        reply =
          "Risk management reminder:\n1. Never risk more than 1-2% per trade\n2. Always define stop-loss before entry\n3. Position size = (Account × Risk%) / (Entry - Stop)\n\nWhat is your current risk per trade?";
      } else {
        reply =
          "Good question. Let me think like your strict mentor...\n\n" +
          "Quick checklist:\n• Is this aligned with your edge?\n• Are you trading your plan or your emotions?\n• What's the worst-case outcome?\n\nTell me more — I want to help you improve.";
      }

      const mentorMsg = {
        id: messages.length + 2,
        sender: "mentor",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, mentorMsg]);
    }, 1200);
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Mentor Mode
        </h1>
        <p className="mt-2 text-lg opacity-80">
          Get honest feedback, discipline reminders, and growth advice from your virtual coach
        </p>
      </div>

      {/* Chat Container */}
      <Card className="rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg h-[calc(100vh-12rem)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : isDark
                    ? "bg-gray-800/90 border border-gray-700 rounded-bl-none"
                    : "bg-gray-100 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.sender === "mentor" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <span className="font-medium">Trading Mentor</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="text-xs opacity-70 mt-2 text-right">
                  {format(new Date(msg.timestamp), "HH:mm")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your last trade, risk, psychology, or anything..."
              className={`flex-1 p-4 rounded-xl border resize-none min-h-[56px] max-h-32
                ${isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} 
                focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-[56px] w-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={20} />
            </Button>
          </div>
          <p className="text-xs text-center mt-3 opacity-60">
            Mentor Mode gives general guidance — not financial advice
          </p>
        </div>
      </Card>
    </div>
  );
}
