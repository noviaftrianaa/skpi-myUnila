"use client";

import { Select, SelectItem, Button } from "@heroui/react";
import { FiFilter, FiX, FiDownload } from "react-icons/fi";

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterPanelProps {
  tahun?: FilterOption[];
  selectedTahun?: string;
  onTahunChange?: (value: string) => void;
  semester?: FilterOption[];
  selectedSemesters?: Set<string>;
  onSemesterChange?: (value: Set<string>) => void;
  fakultas?: FilterOption[];
  selectedFakultas?: string;
  onFakultasChange?: (value: string) => void;
  prodi?: FilterOption[];
  selectedProdi?: string;
  onProdiChange?: (value: string) => void;
  showProdi?: boolean;
  onReset?: () => void;
  onExport?: () => void;
}

export default function FilterPanel({
  tahun = [],
  selectedTahun,
  onTahunChange,
  semester = [],
  selectedSemesters,
  onSemesterChange,
  fakultas = [],
  selectedFakultas,
  onFakultasChange,
  prodi = [],
  selectedProdi,
  onProdiChange,
  showProdi = true,
  onReset,
  onExport,
}: FilterPanelProps) {
  const hasFilter = selectedTahun || (selectedSemesters && selectedSemesters.size > 0) || selectedFakultas || selectedProdi;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-gray-500 mr-2">
        <FiFilter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter</span>
      </div>

      {/* Tahun IKU (single-select) */}
      {tahun.length > 0 && (
        <Select
          size="sm"
          placeholder="Tahun IKU"
          selectedKeys={selectedTahun ? [selectedTahun] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            onTahunChange?.(value);
          }}
          className="w-48"
          variant="bordered"
          classNames={{
            trigger: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-9",
            value: "text-gray-700 dark:text-gray-200 font-medium text-xs",
          }}
          popoverProps={{
            classNames: {
              content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
            },
          }}
        >
          {tahun.map((item) => (
            <SelectItem key={item.key} className="text-gray-700 dark:text-gray-200">
              {item.label}
            </SelectItem>
          ))}
        </Select>
      )}

      {/* Semester (multi-select) */}
      {semester.length > 0 && (
        <Select
          size="sm"
          selectionMode="multiple"
          placeholder="Pilih Semester"
          selectedKeys={selectedSemesters ?? new Set<string>()}
          onSelectionChange={(keys) => {
            if (keys === "all") {
              onSemesterChange?.(new Set(semester.map((s) => s.key)));
            } else {
              onSemesterChange?.(keys as Set<string>);
            }
          }}
          className="w-64"
          variant="bordered"
          classNames={{
            trigger: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-9",
            value: "text-gray-700 dark:text-gray-200 font-medium text-xs",
          }}
          popoverProps={{
            classNames: {
              content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
            },
          }}
          renderValue={(items) => {
            if (items.length > 2) return <span>{items.length} semester dipilih</span>;
            return <span>{items.map((item) => item.textValue).join(", ")}</span>;
          }}
        >
          {semester.map((item) => (
            <SelectItem key={item.key} className="text-gray-700 dark:text-gray-200">
              {item.label}
            </SelectItem>
          ))}
        </Select>
      )}

      {/* Fakultas */}
      {fakultas.length > 0 && (
        <Select
          size="sm"
          placeholder="Pilih Fakultas"
          selectedKeys={selectedFakultas ? [selectedFakultas] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            onFakultasChange?.(value === "__all__" ? "" : value);
          }}
          className="w-56"
          variant="bordered"
          classNames={{
            trigger: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-9",
            value: "text-gray-700 dark:text-gray-200 font-medium text-xs",
          }}
          popoverProps={{
            classNames: {
              content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
            },
          }}
        >
          {[
            <SelectItem key="__all__" className="text-gray-700 dark:text-gray-200 font-semibold">
              Universitas (Semua)
            </SelectItem>,
            ...fakultas.map((item) => (
              <SelectItem key={item.key} className="text-gray-700 dark:text-gray-200">
                {item.label}
              </SelectItem>
            )),
          ]}
        </Select>
      )}

      {/* Prodi - Animated Appearance */}
      {showProdi && selectedFakultas && prodi.length > 0 && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          <Select
            size="sm"
            placeholder="Pilih Prodi"
            selectedKeys={selectedProdi ? [selectedProdi] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              onProdiChange?.(value);
            }}
            className="w-56"
            variant="bordered"
            classNames={{
              trigger: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-9",
              value: "text-gray-700 dark:text-gray-200 font-medium",
            }}
            popoverProps={{
              classNames: {
                content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
              },
            }}
          >
            {prodi.map((item) => (
              <SelectItem key={item.key} className="text-gray-700 dark:text-gray-200">
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {hasFilter && onReset && (
          <Button
            size="sm"
            variant="flat"
            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 h-9"
            startContent={<FiX className="w-4 h-4" />}
            onPress={onReset}
          >
            Reset
          </Button>
        )}
        {onExport && (
          <Button
            size="sm"
            className="bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 font-medium h-9"
            startContent={<FiDownload className="w-4 h-4" />}
            onPress={onExport}
          >
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
