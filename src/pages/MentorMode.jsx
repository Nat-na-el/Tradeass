import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import { MessageSquare, Send, User, Bot, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function MentorMode() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "mentor",
      content:
        "Welcome to Mentor Mode.\n\nI'm your virtual trading coach.\n\nTell me about your last trade, ask about risk management, psychology, strategy — anything.\nI'm here to give you honest, no-BS feedback.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulated mentor reply (you can replace with real AI later)
    setTimeout(() => {
      let reply = "Got it. Let me think like your strict mentor...\n\n";

      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("trade") || lowerInput.includes("review")) {
        reply +=
          "Let's review that trade properly.\n• What was your original setup & reason?\n• Did you follow your written rules 100%?\n• What emotion drove the entry/exit?\n• What would you do differently next time?\n\nGive me more details — I want to help you improve.";
      } else if (lowerInput.includes("risk") || lowerInput.includes("stop") || lowerInput.includes("size")) {
        reply +=
          "Risk management check:\n1. Max risk per trade should be 0.5–2% (1% is golden)\n2. Stop-loss must be set BEFORE entry\n3. Position size = (Account × Risk%) / (Entry - Stop)\n\nWhat % of your account are you risking on average right now?";
      } else if (lowerInput.includes("emotion") || lowerInput.includes("psychology") || lowerInput.includes("tilt")) {
        reply +=
          "Emotional control reminder:\n• Revenge trading = account killer\n• FOMO = expensive lessons\n• Greed after a win = next loss\n\nRate your emotional state during your last 5 trades (1–10). What patterns do you see?";
      } else {
        reply +=
          "Good question.\nQuick reality check:\n• Is this aligned with your proven edge?\n• Are you trading your plan or your feelings?\n• What's the worst realistic outcome?\n• How will you know you're wrong quickly?\n\nTell me more — let's build clarity.";
      }

      const mentorReply = {
        id: messages.length + 2,
        sender: "mentor",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, mentorReply]);
    }, 1200);
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Mentor Mode
          </h1>
          <p className="mt-2 text-lg opacity-80">
            Get straight, no-nonsense feedback from your virtual trading coach
          </p>
        </div>

        <Card
          className={`rounded-2xl overflow-hidden border shadow-2xl flex flex-col h-[calc(100vh-12rem)] 
            ${isDark ? "bg-gray-900/80 border-gray-700/60" : "bg-white/80 border-gray-200/60"}`}
        >
          {/* Messages Area */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm
                    ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : isDark
                        ? "bg-gray-800 border border-gray-700 rounded-bl-none"
                        : "bg-gray-100 border border-gray-200 rounded-bl-none"
                    }`}
                >
                  {msg.sender === "mentor" && (
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                        M
                      </div>
                      <span className="font-semibold">Trading Mentor</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                  <div className="text-xs opacity-70 mt-2.5 text-right">
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your last trade, risk, tilt, strategy... be specific"
                className={`flex-1 p-4 rounded-xl border resize-none min-h-[56px] max-h-32 text-sm
                  ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }
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
              Mentor gives general guidance — not financial advice
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

