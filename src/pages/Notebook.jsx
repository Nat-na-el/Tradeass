import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import {
  Plus,
  Trash2,
  Pin,
  Search,
  Download,
  Upload,
  Edit,
  X,
  Tag,
  AlertTriangle,
  Star,
  FileText,
  Calendar,
} from "lucide-react";

const NOTE_TAGS = [
  { value: "psychology", label: "Psychology", color: "indigo" },
  { value: "strategy", label: "Strategy", color: "cyan" },
  { value: "mistake", label: "Mistake", color: "rose" },
  { value: "win-review", label: "Win Review", color: "emerald" },
  { value: "idea", label: "Idea", color: "violet" },
  { value: "other", label: "Other", color: "gray" },
];

const PRIORITY_COLORS = {
  low: "gray",
  medium: "amber",
  high: "rose",
};

const MarkdownRenderer = ({ text }) => {
  // Very simple markdown rendering (bold, italic, lists, quotes)
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("- ")) {
          return <li key={i}>{line.slice(2)}</li>;
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-indigo-500 pl-3 italic opacity-90">
              {line.slice(2)}
            </blockquote>
          );
        }
        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>"),
            }}
          />
        );
      })}
    </div>
  );
};

export default function Notebook() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("other");
  const [newPriority, setNewPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState("other");
  const [editPriority, setEditPriority] = useState("medium");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, priority, tag
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load notes + draft
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notebook_notes") || "[]");
    const draft = localStorage.getItem("notebook_draft");
    setNotes(stored);
    if (draft) setNewNote(draft);
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newNote.trim()) {
        localStorage.setItem("notebook_draft", newNote);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [newNote]);

  const saveNotes = (updated) => {
    setNotes(updated);
    localStorage.setItem("notebook_notes", JSON.stringify(updated));
    localStorage.removeItem("notebook_draft"); // clear draft after save
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      tag: newTag,
      priority: newPriority,
      date: new Date().toISOString(),
      isPinned: false,
    };

    saveNotes([note, ...notes]);
    setNewNote("");
    setNewTag("other");
    setNewPriority("medium");
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditTag(note.tag || "other");
    setEditPriority(note.priority || "medium");
  };

  const saveEdit = () => {
    if (!editContent.trim()) return;
    const updated = notes.map((n) =>
      n.id === editingId
        ? { ...n, content: editContent.trim(), tag: editTag, priority: editPriority }
        : n
    );
    saveNotes(updated);
    setEditingId(null);
  };

  const deleteNote = (id) => {
    if (!window.confirm("Delete this note permanently?")) return;
    saveNotes(notes.filter((n) => n.id !== id));
  };

  const togglePin = (id) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    saveNotes(updated);
  };

  const toggleSelect = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const bulkDelete = () => {
    if (!selectedNotes.length || !window.confirm(`Delete ${selectedNotes.length} notes?`)) return;
    saveNotes(notes.filter((n) => !selectedNotes.includes(n.id)));
    setSelectedNotes([]);
  };

  const exportNotes = () => {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importNotes = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          if (window.confirm(`Import ${imported.length} notes? This will replace current notes.`)) {
            saveNotes(imported);
          }
        }
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // Filtered & sorted notes
  const displayedNotes = useMemo(() => {
    let result = [...notes];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.content.toLowerCase().includes(q) ||
          n.tag?.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (filterTag) {
      result = result.filter((n) => n.tag === filterTag);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "priority") {
        const prio = { high: 3, medium: 2, low: 1 };
        return prio[b.priority || "medium"] - prio[a.priority || "medium"];
      }
      if (sortBy === "tag") return (a.tag || "").localeCompare(b.tag || "");
      return 0;
    });

    // Pinned always first
    const pinned = result.filter((n) => n.isPinned);
    const unpinned = result.filter((n) => !n.isPinned);

    return [...pinned, ...unpinned];
  }, [notes, searchQuery, filterTag, sortBy]);

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Trading Notebook
          </h1>
          <p className="mt-2 opacity-80 text-lg">
            Capture insights • Review mistakes • Build your edge
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportNotes}
            variant="outline"
            className="border-indigo-500/40 hover:bg-indigo-500/10"
          >
            <Download size={18} className="mr-2" /> Backup
          </Button>

          <label>
            <input
              type="file"
              accept=".json"
              onChange={importNotes}
              className="hidden"
            />
            <Button
              variant="outline"
              className="border-purple-500/40 hover:bg-purple-500/10 cursor-pointer"
            >
              <Upload size={18} className="mr-2" /> Restore
            </Button>
          </label>

          <Button
            onClick={() => {
              setEditingId(null);
              setNewNote("");
              setNewTag("other");
              setNewPriority("medium");
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} className="mr-2" /> New Note
          </Button>
        </div>
      </div>

      {/* Quick Stats & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="text-sm opacity-70 mb-1">Total Notes</div>
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {notes.length}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="text-sm opacity-70 mb-1">Pinned</div>
          <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
            {notes.filter((n) => n.isPinned).length}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-gray-800/60 border-gray-700 text-white placeholder-gray-400"
                    : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
            </div>

            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className={`px-4 py-3 rounded-xl border min-w-[180px] ${
                isDark
                  ? "bg-gray-800/60 border-gray-700 text-white"
                  : "bg-white/80 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-indigo-500 outline-none`}
            >
              <option value="">All Tags</option>
              {NOTE_TAGS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-xl border min-w-[180px] ${
                isDark
                  ? "bg-gray-800/60 border-gray-700 text-white"
                  : "bg-white/80 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-indigo-500 outline-none`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="tag">Tag</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedNotes.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 dark:bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-between">
          <div className="font-medium">
            {selectedNotes.length} note{selectedNotes.length !== 1 ? "s" : ""} selected
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={bulkDelete}
          >
            <Trash2 size={16} className="mr-2" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Notes Grid */}
      {displayedNotes.length === 0 ? (
        <Card className="p-12 text-center bg-white/50 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your notebook is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Start capturing your trading psychology, strategies, mistakes, and ideas.
          </p>
          <Button
            onClick={() => document.querySelector("textarea")?.focus()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-2" /> Write First Note
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNotes.map((note) => {
            const isEditing = editingId === note.id;
            const tagInfo = NOTE_TAGS.find((t) => t.value === note.tag) || NOTE_TAGS[5];
            const prioColor = PRIORITY_COLORS[note.priority] || "gray";

            return (
              <Card
                key={note.id}
                className={`relative p-6 rounded-2xl border transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1
                  ${isDark
                    ? "bg-gray-800/50 border-gray-700/50 backdrop-blur-md"
                    : "bg-white/80 border-gray-200/50 backdrop-blur-md"} 
                  ${note.isPinned ? "ring-2 ring-amber-500/50" : ""}`}
              >
                {/* Selection checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.id)}
                    onChange={() => toggleSelect(note.id)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Pin button */}
                <button
                  onClick={() => togglePin(note.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                    note.isPinned
                      ? "bg-amber-500/20 text-amber-500"
                      : "opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Pin size={18} className={note.isPinned ? "fill-amber-500" : ""} />
                </button>

                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={`w-full p-4 rounded-xl border min-h-[160px] resize-y font-mono text-sm
                        ${isDark ? "bg-gray-900/60 border-gray-600" : "bg-white border-gray-300"}`}
                      autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1.5 opacity-70">Tag</label>
                        <select
                          value={editTag}
                          onChange={(e) => setEditTag(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border text-sm
                            ${isDark ? "bg-gray-900 border-gray-600" : "bg-white border-gray-300"}`}
                        >
                          {NOTE_TAGS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs mb-1.5 opacity-70">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border text-sm
                            ${isDark ? "bg-gray-900 border-gray-600" : "bg-white border-gray-300"}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={saveEdit}
                        disabled={!editContent.trim()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tags & Priority */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full
                          bg-${tagInfo.color}-500/20 text-${tagInfo.color}-700 dark:bg-${tagInfo.color}-900/30 dark:text-${tagInfo.color}-300`}
                      >
                        {tagInfo.label}
                      </span>

                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full
                          bg-${prioColor}-500/20 text-${prioColor}-700 dark:bg-${prioColor}-900/30 dark:text-${prioColor}-300`}
                      >
                        {note.priority?.toUpperCase() || "MEDIUM"}
                      </span>

                      {note.isPinned && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          PINNED
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-h-[120px] max-h-[240px] overflow-hidden">
                      <MarkdownRenderer text={note.content} />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs opacity-60 flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(note.date), "dd MMM yyyy • HH:mm")}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(note)}
                          className="hover:bg-indigo-500/10"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
