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
          dark:bg-gradient-to-b dark:from-blue-950 dark:to-gray-950 
          dark:text-white 
          border border-slate-300 dark:border-blue-800/50 
          rounded-2xl shadow-2xl p-6
          backdrop-blur-sm
        `}
        aria-describedby="delete-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-5" id="delete-modal-description">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        <DialogFooter className="gap-4 sm:gap-6">
          <Button
            variant="outline"
            onClick={onClose}
            className={`
              border border-slate-400 dark:border-blue-700/60 
              text-slate-700 dark:text-slate-300 
              hover:bg-slate-100 dark:hover:bg-blue-900/20 
              transition-all duration-200
            `}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            className={`
              bg-red-600 hover:bg-red-700 active:bg-red-800 
              text-white font-medium 
              shadow-md hover:shadow-lg 
              transition-all duration-200
            `}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
