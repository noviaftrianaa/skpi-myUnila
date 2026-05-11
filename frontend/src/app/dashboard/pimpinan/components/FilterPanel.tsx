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
  showFakultas?: boolean;
  showProdi?: boolean;
  /** Optional badge label di sebelah "Filter" — utk menampilkan scope role-based (mis. "Fakultas Teknik") */
  scopeBadge?: string | null;
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
  showFakultas = true,
  showProdi = true,
  scopeBadge,
  onReset,
  onExport,
}: FilterPanelProps) {
  const hasFilter = selectedTahun || (selectedSemesters && selectedSemesters.size > 0) || selectedFakultas || selectedProdi;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-gray-500 mr-2">
        <FiFilter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter</span>
        {scopeBadge ? (
          // Dekan/Kaprodi — scope dipaksa (locked)
          <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50" title="Scope dikunci sesuai role">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/></svg>
            {scopeBadge}
          </span>
        ) : (
          // Rektor / Universitas — bebas (badge informatif)
          <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50" title="Anda dapat melihat semua data (level Universitas)">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>
            Lihat Semua Data
          </span>
        )}
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
      {showFakultas && fakultas.length > 0 && (
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
