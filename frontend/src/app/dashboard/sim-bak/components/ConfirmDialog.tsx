'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const iconColor = {
    primary: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    danger: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    success: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 overflow-hidden">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full ${iconColor[confirmColor]} flex items-center justify-center mx-auto mb-4`}>
            {confirmColor === 'danger' ? <FiAlertTriangle className="w-6 h-6" /> : <FiCheck className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
              confirmColor === 'danger'
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : confirmColor === 'success'
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
