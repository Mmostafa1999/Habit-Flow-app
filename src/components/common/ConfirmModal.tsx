// components/ConfirmModal.tsx

import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes, confirm",
  cancelText = "Cancel",
  icon,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md p-6">
            <div className="text-center">
              {icon || (
                <svg
                  className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              )}
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                {title}
              </h3>
              <p className="mb-6 text-gray-500 dark:text-gray-300">{description}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onConfirm}
                  className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
