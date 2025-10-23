import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import { Plus, Trash2 } from "lucide-react";

export default function Notebook() {
  const { theme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(stored);
  }, []);

  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      content: newNote,
      date: new Date().toISOString(),
      isPinned: false,
    };
    saveNotes([note, ...notes]);
    setNewNote("");
  };

  const updateNote = (id, content) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, content } : note
    );
    saveNotes(updated);
    setEditingId(null);
    setEditContent("");
  };

  const deleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;
    saveNotes(notes.filter((n) => n.id !== id));
  };

  const pinNote = (id) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    saveNotes(updated);
  };

  return (
    <div
      className={`p-4 sm:p-6 bg-white dark:bg-gray-900 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Notes
        </h2>
      </div>

      {/* Add New Note */}
      <Card className="mb-6 p-4">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a new note..."
            className="flex-1 p-3 border rounded-md dark:bg-gray-800 dark:text-gray-200"
            rows="3"
          />
          <Button onClick={addNote} disabled={!newNote.trim()}>
            <Plus size={16} />
          </Button>
        </div>
      </Card>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id} className="p-4">
            {editingId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 mb-2"
                  rows="4"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateNote(note.id, editContent)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      note.isPinned
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {note.isPinned ? "PINNED" : "NOTE"}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap mb-2">{note.content}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => pinNote(note.id)}
                  >
                    {note.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  <span className="text-xs text-gray-500">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
          No notes yet. Add your first note above!
        </Card>
      )}
    </div>
  );
}
