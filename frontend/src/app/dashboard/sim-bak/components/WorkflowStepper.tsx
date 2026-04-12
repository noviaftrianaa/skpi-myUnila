'use client';

import React from 'react';
import { FiCheck, FiClock, FiCircle } from 'react-icons/fi';

interface TahapanItem {
  id_tahapan: string;
  urutan: number;
  nm_tahapan: string;
  kode_role: string;
  status_masuk: string;
  status_selesai: string;
  stage_status: 'completed' | 'active' | 'pending';
}

interface WorkflowStepperProps {
  tahapanList: TahapanItem[];
  currentStep: number;
  totalSteps: number;
}

const roleLabels: Record<string, string> = {
  mahasiswa: 'Mahasiswa',
  admin_fakultas: 'Admin Fakultas',
  admin_bak: 'Admin BAK',
  pejabat: 'Pejabat',
  system: 'Sistem',
};

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  tahapanList,
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Progress Tahapan
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Tahap {currentStep} dari {totalSteps}
        </span>
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-start gap-0 overflow-x-auto pb-2">
        {tahapanList.map((tahapan, index) => (
          <div key={tahapan.id_tahapan} className="flex items-start flex-1 min-w-0">
            {/* Step circle + content */}
            <div className="flex flex-col items-center text-center flex-shrink-0 w-full">
              <div className="flex items-center w-full">
                {/* Left connector line */}
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      tahapan.stage_status === 'completed' || tahapan.stage_status === 'active'
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
                {index === 0 && <div className="flex-1" />}

                {/* Circle */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    tahapan.stage_status === 'completed'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : tahapan.stage_status === 'active'
                      ? 'bg-white dark:bg-gray-800 border-blue-500 text-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {tahapan.stage_status === 'completed' ? (
                    <FiCheck className="w-4 h-4" />
                  ) : tahapan.stage_status === 'active' ? (
                    <FiClock className="w-4 h-4" />
                  ) : (
                    <FiCircle className="w-3 h-3" />
                  )}
                </div>

                {/* Right connector line */}
                {index < tahapanList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      tahapan.stage_status === 'completed'
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
                {index === tahapanList.length - 1 && <div className="flex-1" />}
              </div>

              {/* Label */}
              <div className="mt-2 px-1">
                <p
                  className={`text-xs font-medium leading-tight ${
                    tahapan.stage_status === 'active'
                      ? 'text-blue-600 dark:text-blue-400'
                      : tahapan.stage_status === 'completed'
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {tahapan.nm_tahapan}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {roleLabels[tahapan.kode_role] || tahapan.kode_role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: vertical stepper */}
      <div className="md:hidden space-y-0">
        {tahapanList.map((tahapan, index) => (
          <div key={tahapan.id_tahapan} className="flex gap-3">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  tahapan.stage_status === 'completed'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : tahapan.stage_status === 'active'
                    ? 'bg-white border-blue-500 text-blue-500'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {tahapan.stage_status === 'completed' ? (
                  <FiCheck className="w-3 h-3" />
                ) : tahapan.stage_status === 'active' ? (
                  <FiClock className="w-3 h-3" />
                ) : (
                  <FiCircle className="w-2 h-2" />
                )}
              </div>
              {index < tahapanList.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[20px] ${
                    tahapan.stage_status === 'completed'
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0">
              <p
                className={`text-sm font-medium ${
                  tahapan.stage_status === 'active'
                    ? 'text-blue-600'
                    : tahapan.stage_status === 'completed'
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {tahapan.nm_tahapan}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {roleLabels[tahapan.kode_role] || tahapan.kode_role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowStepper;
