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
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-slate-900 dark:bg-[#135fa6] dark:text-white border border-slate-300 dark:border-[#B78727]/20 rounded-2xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-200">
            Are you sure you want to delete this trade? This action cannot be
            undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-slate-400 dark:border-[#B78727]/20 text-slate-900 dark:text-white bg-white dark:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
