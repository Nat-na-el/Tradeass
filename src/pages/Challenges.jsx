import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import {
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// Sample data — in real app you would load from localStorage or backend
const SAMPLE_CHALLENGES = [
  {
    id: "consistency-30",
    title: "30-Day Consistency Challenge",
    description: "Execute at least 1 trade every trading day for 30 consecutive days",
    target: 30,
    current: 12,
    type: "streak",
    reward: "Custom badge + premium journal template",
    active: true,
    endDate: new Date(2025, 2, 15).toISOString(), // March 15, 2025
  },
  {
    id: "profit-goal",
    title: "Monthly Profit Goal",
    description: "Achieve +$500 net profit this month",
    target: 500,
    current: 320,
    type: "profit",
    reward: "Double mentor sessions next month",
    active: true,
    endDate: endOfMonth(new Date()).toISOString(),
  },
  {
    id: "risk-control",
    title: "Max 1% Risk Discipline",
    description: "Complete 50 trades without exceeding 1% account risk on any trade",
    target: 50,
    current: 28,
    type: "discipline",
    reward: "Priority support + personalized trade review",
    active: true,
    endDate: new Date(2025, 5, 30).toISOString(),
  },
  {
    id: "no-revenge",
    title: "No Revenge Trading",
    description: "Avoid revenge trades for 60 consecutive days",
    target: 60,
    current: 0,
    type: "psychology",
    reward: "Psychology deep-dive session",
    active: false,
    completed: true,
  },
];

export default function Challenges() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [challenges, setChallenges] = useState([]);

  // Load or initialize challenges
  useEffect(() => {
    const saved = localStorage.getItem("challenges");
    if (saved) {
      setChallenges(JSON.parse(saved));
    } else {
      setChallenges(SAMPLE_CHALLENGES);
      localStorage.setItem("challenges", JSON.stringify(SAMPLE_CHALLENGES));
    }
  }, []);

  const saveChallenges = (updated) => {
    setChallenges(updated);
    localStorage.setItem("challenges", JSON.stringify(updated));
  };

  const getProgress = (challenge) => {
    return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
  };

  const formatDate = (isoString) => {
    try {
      return format(new Date(isoString), "MMM d, yyyy");
    } catch {
      return "—";
    }
  };

  const activeChallenges = challenges.filter((c) => c.active);
  const completedChallenges = challenges.filter((c) => !c.active && c.completed);

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
          Build discipline • Track progress • Unlock rewards
        </p>
      </div>

      {activeChallenges.length === 0 && completedChallenges.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-dashed">
          <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-2xl font-semibold mb-3">No challenges yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            Start a challenge to push your trading skills and stay accountable.
          </p>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            Create Your First Challenge
          </Button>
        </Card>
      ) : (
        <>
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Flame className="text-orange-500" size={28} /> Active Challenges
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeChallenges.map((challenge) => {
                  const progress = getProgress(challenge);
                  const isCompleted = progress >= 100;

                  return (
                    <Card
                      key={challenge.id}
                      className={`relative p-6 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                        ${isDark
                          ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-md"
                          : "bg-white/80 border-gray-200/50 backdrop-blur-md"}`}
                    >
                      {isCompleted && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                          COMPLETED
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="pr-10">
                          <h3 className="text-xl font-bold">{challenge.title}</h3>
                          <p className="text-sm opacity-80 mt-1.5">{challenge.description}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {isCompleted ? <CheckCircle2 size={28} /> : <Target size={28} />}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-5">
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div className="opacity-80">
                          {challenge.current} / {challenge.target}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Clock size={14} />
                          Ends {formatDate(challenge.endDate)}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-sm opacity-80 flex items-center gap-2">
                          <Trophy size={16} className="text-amber-400" />
                          Reward: {challenge.reward}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {completedChallenges.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="text-yellow-500" size={28} /> Completed Challenges
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className={`p-6 rounded-2xl border bg-gradient-to-br from-emerald-900/10 to-emerald-950/5
                      ${isDark ? "border-emerald-800/30" : "border-emerald-200/40"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{challenge.title}</h3>
                        <p className="text-sm opacity-80 mt-1">{challenge.description}</p>
                        <div className="mt-5 text-sm flex items-center gap-2 text-emerald-400 font-medium">
                          <Trophy size={16} />
                          Reward unlocked: {challenge.reward}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
