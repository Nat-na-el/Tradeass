import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import {
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const SAMPLE_CHALLENGES = [
  {
    id: "consistency-30",
    title: "30-Day Consistency Challenge",
    description: "Execute at least 1 trade every trading day for 30 consecutive days",
    target: 30,
    current: 12,
    type: "streak",
    reward: "Custom badge + journal template unlock",
    active: true,
    endDate: "2025-03-15",
  },
  {
    id: "profit-goal",
    title: "Monthly Profit Goal",
    description: "Achieve +$500 net profit in February",
    target: 500,
    current: 320,
    type: "profit",
    reward: "Double analysis sessions next month",
    active: true,
    endDate: "2025-02-28",
  },
  {
    id: "risk-control",
    title: "Max 1% Risk Per Trade",
    description: "Complete 50 trades without exceeding 1% account risk on any single position",
    target: 50,
    current: 0,
    type: "discipline",
    reward: "Priority support + personalized review",
    active: false,
    completed: true,
  },
];

export default function Challenges() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [challenges, setChallenges] = useState(SAMPLE_CHALLENGES);

  // In real app you would load/save from localStorage or backend
  useEffect(() => {
    // Example: load from localStorage
    const saved = localStorage.getItem("challenges");
    if (saved) {
      setChallenges(JSON.parse(saved));
    }
  }, []);

  const saveChallenges = (updated) => {
    setChallenges(updated);
    localStorage.setItem("challenges", JSON.stringify(updated));
  };

  const getProgressPercentage = (challenge) => {
    return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
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
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Trading Challenges
        </h1>
        <p className="mt-2 text-lg opacity-80">
          Push your limits • Build discipline • Earn rewards
        </p>
      </div>

      {/* Active Challenges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Flame className="text-orange-500" size={28} /> Active Challenges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges
            .filter((c) => c.active)
            .map((challenge) => {
              const progress = getProgressPercentage(challenge);
              const isCompleted = progress >= 100;

              return (
                <Card
                  key={challenge.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                    ${isDark
                      ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-md"
                      : "bg-white/80 border-gray-200/50 backdrop-blur-md"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{challenge.title}</h3>
                      <p className="text-sm opacity-80 mt-1">{challenge.description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 /> : <Target />}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="opacity-80">
                      {challenge.current} / {challenge.target}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Ends {format(new Date(challenge.endDate), "MMM d")}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs opacity-70 flex items-center gap-1.5">
                      <Star size={14} className="text-amber-400" />
                      Reward: {challenge.reward}
                    </p>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Completed Challenges */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Trophy className="text-yellow-500" size={28} /> Completed Challenges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges
            .filter((c) => !c.active)
            .map((challenge) => (
              <Card
                key={challenge.id}
                className={`p-6 rounded-2xl border bg-gradient-to-br from-emerald-900/20 to-emerald-950/10
                  ${isDark ? "border-emerald-800/30" : "border-emerald-200/50"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{challenge.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{challenge.description}</p>
                    <div className="mt-4 text-sm flex items-center gap-2 text-emerald-400">
                      <Trophy size={16} />
                      <span>Reward claimed: {challenge.reward}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {challenges.filter((c) => !c.active).length === 0 && (
          <Card className="p-10 text-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-dashed">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No completed challenges yet</h3>
            <p className="opacity-70">
              Finish your active challenges to unlock rewards and badges!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
