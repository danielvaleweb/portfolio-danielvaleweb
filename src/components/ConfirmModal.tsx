import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, HelpCircle, AlertCircle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  iconType?: "info" | "danger" | "warning";
  confirmLabel: string;
  cancelLabel?: string;
  severity?: "primary" | "danger" | "secondary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  iconType = "warning",
  confirmLabel,
  cancelLabel = "Cancelar",
  severity = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  
  // Icon selector
  const renderIcon = () => {
    switch (iconType) {
      case "danger":
        return (
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
            <AlertCircle size={22} />
          </div>
        );
      case "info":
        return (
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
            <HelpCircle size={22} />
          </div>
        );
      case "warning":
      default:
        return (
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
            <AlertTriangle size={22} />
          </div>
        );
    }
  };

  // Button styles based on severity
  const getConfirmButtonStyles = () => {
    switch (severity) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white hover:shadow-[0_8px_20px_rgba(220,38,38,0.2)]";
      case "primary":
      default:
        return "bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white hover:shadow-[0_8px_20px_rgba(255,99,33,0.2)]";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onCancel()}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-white dark:bg-[#161616] rounded-2xl w-full max-w-md shadow-2xl border border-neutral-100 dark:border-[#262626] p-6 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-100 dark:border-[#262626]">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 hover:bg-neutral-50 dark:hover:bg-[#222] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex gap-4 items-start py-2 mb-6">
              {renderIcon()}
              <div className="flex-1">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions/Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-[#262626]">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-5 py-2.5 bg-white dark:bg-[#222] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] active:scale-[0.98] text-neutral-700 dark:text-neutral-200 text-xs font-semibold tracking-wide rounded-xl border border-neutral-200 dark:border-[#333] transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-5 py-2.5 text-xs font-semibold tracking-wide rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${getConfirmButtonStyles()}`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
