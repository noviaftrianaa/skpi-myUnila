'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { FiInbox, FiFileText, FiUsers, FiSearch } from 'react-icons/fi';

type EmptyVariant = 'default' | 'search' | 'document' | 'users';

const icons: Record<EmptyVariant, React.ReactNode> = {
  default: <FiInbox className="w-12 h-12" />,
  search: <FiSearch className="w-12 h-12" />,
  document: <FiFileText className="w-12 h-12" />,
  users: <FiUsers className="w-12 h-12" />,
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  variant?: EmptyVariant;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'Tidak ada data',
  description = 'Data yang Anda cari belum tersedia.',
  variant = 'default',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
        {icons[variant]}
      </div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          className="mt-4"
          color="primary"
          variant="flat"
          size="sm"
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
