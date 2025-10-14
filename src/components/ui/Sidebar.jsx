// src/components/ui/Sidebar.jsx
import React from "react";
import {
  Home,
  BookOpen,
  BarChart2,
  FileText,
  PlayCircle,
  Award,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { Separator } from "./separator";
import { cn } from "../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Daily Journal", path: "/journal" },
  { icon: BarChart2, label: "Trades", path: "/trades" },
  { icon: FileText, label: "Notebook", path: "/notebook" },
  { icon: PlayCircle, label: "Reports", path: "/reports" },
  { icon: Award, label: "Challenges", path: "/challenges" },
  { icon: Users, label: "Mentor Mode", path: "/mentor" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar({ open = true, setOpen = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-[1rem] left-[4.5rem] z-40 flex flex-col backdrop-blur-xl shadow-2xl border transition-all duration-500 ease-in-out",
        "bg-white/90 dark:bg-[#0f1724]/95 border-slate-200 dark:border-white/10",
        open ? "w-44" : "w-14"
      )}
      style={{
        borderRadius: "1.25rem",
        height: "calc(100vh - 5rem)",
        marginTop: "3.3rem",
        transition: "all 0.4s ease-in-out",
      }}
    >
      {/* Toggle Button */}
      <div className="p-3 flex items-center justify-center">
        <button
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          {open ? (
            <X className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          ) : (
            <Menu className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-3 space-y-[2px] px-3 overflow-y-auto">
        {navItems.map((it) => {
          const active = location.pathname === it.path;
          return (
            <div
              key={it.label}
              onClick={() => navigate(it.path)}
              className={cn(
                "flex items-center w-full cursor-pointer rounded-lg transition-all duration-200 select-none",
                active
                  ? "bg-indigo-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10",
                !open ? "justify-center p-2" : "gap-3 px-3 py-2"
              )}
            >
              <div className="flex items-center justify-center w-6 h-6">
                <it.icon
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200",
                    active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-300"
                  )}
                />
              </div>
              {open && (
                <span
                  className={cn(
                    "text-[13px] leading-[1.2] tracking-wide font-medium whitespace-nowrap transition-colors duration-200",
                    active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {it.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <Separator className="opacity-20 dark:opacity-10" />

      {/* User Info */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {open && <div className="text-[11px] leading-tight"></div>}
        </div>
      </div>
    </aside>
  );
}
