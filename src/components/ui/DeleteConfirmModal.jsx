// src/components/ui/DeleteConfirmModal.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          max-w-md 
          bg-white text-slate-900 
          dark:bg-gray-900 dark:text-white 
          border border-slate-300 dark:border-gray-700 
          rounded-2xl shadow-2xl p-6
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        <DialogFooter className="gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className={`
              border border-slate-400 dark:border-gray-600 
              text-slate-700 dark:text-gray-300 
              hover:bg-slate-100 dark:hover:bg-gray-800
              transition-colors
            `}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            className={`
              bg-red-600 hover:bg-red-700 
              text-white 
              shadow-md hover:shadow-lg 
              transition-all
            `}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
