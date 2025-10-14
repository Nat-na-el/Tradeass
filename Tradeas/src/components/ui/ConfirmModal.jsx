// src/components/ui/ConfirmModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

export default function ConfirmModal({
  message,
  onConfirm,
  triggerLabel = "Delete",
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The button that opens the dialog */}
      <DialogTrigger asChild>
        <Button variant="destructive">{triggerLabel}</Button>
      </DialogTrigger>

      {/* The confirmation dialog */}
      <DialogContent className="text-center bg-white dark:bg-[#0f1724] rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-white/10">
        <p className="text-slate-800 dark:text-white text-sm mb-4">{message}</p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
