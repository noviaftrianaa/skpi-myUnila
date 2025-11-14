"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Select,
  SelectItem,
} from "@heroui/react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: string;
  minWidth?: string;
  render?: (item: T, index?: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: string[];
  searchPlaceholder?: string;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  className?: string;
  filterSlot?: React.ReactNode;
  noWrapper?: boolean;
  loading?: boolean;
  serverSide?: boolean;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  onSearchChange?: (query: string) => void;
  onSortChange?: (key: string, order: "asc" | "desc") => void;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  searchPlaceholder = "Cari data...",
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  className = "",
  filterSlot,
  noWrapper = false,
  loading = false,
  serverSide = false,
  totalRecords,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onSortChange,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [selectedKey, setSelectedKey] = useState(String(defaultRowsPerPage));
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Create select items with "Semua" option
  const selectItems = useMemo(() => {
    return [
      ...rowsPerPageOptions.map(option => ({ 
        key: String(option), 
        label: String(option) 
      })), 
      { key: "all", label: "Semua" }
    ];
  }, [rowsPerPageOptions]);

  // For server-side mode, use data as-is. For client-side, filter and paginate
  const filteredData = useMemo(() => {
    const safeData = data || [];
    if (serverSide) return safeData;
    if (!searchValue || searchKeys.length === 0) return safeData;

    return safeData.filter((item) =>
      searchKeys.some((key) =>
        String(item[key])
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    );
  }, [data, searchValue, searchKeys, serverSide]);

  // Sort data (only for client-side)
  const sortedData = useMemo(() => {
    if (serverSide || !sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle numeric values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortColumn, sortDirection, serverSide]);

  // Paginate data (only for client-side)
  const paginatedData = useMemo(() => {
    if (serverSide) return data || []; // Server already paginated, ensure array
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const safeSortedData = sortedData || [];
    return safeSortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage, data, serverSide]);

  const totalPages = serverSide
    ? Math.ceil((totalRecords || 0) / rowsPerPage)
    : Math.ceil((sortedData || []).length / rowsPerPage);

  const totalDataCount = serverSide ? (totalRecords || 0) : (sortedData || []).length;

  // Handle sort column click
  const handleSort = (key: string) => {
    let newDirection: "asc" | "desc";

    if (sortColumn === key) {
      // Toggle direction if same column
      newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      // New column, default to ascending
      setSortColumn(key);
      newDirection = "asc";
      setSortDirection(newDirection);
    }

    // Call parent callback for server-side sorting
    if (serverSide && onSortChange) {
      onSortChange(key, newDirection);
    }
  };

  const content = (
    <>
      {/* Search & Controls Bar - Modern Design */}
      <div className={`px-6 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-gray-200 ${!noWrapper ? 'rounded-t-2xl' : 'rounded-t-xl'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Filter (jika ada) - Kiri */}
          {filterSlot && (
            <div className="lg:col-span-3">
              {filterSlot}
            </div>
          )}

          {/* Search - Tengah (flexible) */}
          {searchable && (
            <div className={filterSlot ? "lg:col-span-6" : "lg:col-span-9"}>
              <Input
                isClearable
                classNames={{
                  base: "w-full",
                  inputWrapper: "!bg-white !h-9 !rounded-xl !border-0 !shadow-none hover:!bg-gray-50 !transition-all !duration-200 [&>div]:!border-0",
                  input: "!text-sm !text-gray-700 placeholder:!text-gray-400 !border-0",
                  clearButton: "!text-gray-400 hover:!text-gray-600",
                }}
                placeholder={searchPlaceholder}
                size="md"
                startContent={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                value={searchValue}
                onValueChange={(value) => {
                  setSearchValue(value);
                  setPage(1);
                  if (serverSide && onSearchChange) {
                    onSearchChange(value);
                  }
                }}
              />
            </div>
          )}

          {/* Rows per page selector - Kanan */}
          <div className="lg:col-span-3 flex gap-3 items-center justify-start lg:justify-end">
            <span className="text-gray-600 font-medium text-sm whitespace-nowrap">Tampilkan</span>
            <Select
              size="sm"
              selectedKeys={[selectedKey]}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedKey(value);
                if (value === "all") {
                  // For "Semua", use total data count
                  const newRowsPerPage = serverSide ? (totalRecords || 9999) : filteredData.length;
                  setRowsPerPage(newRowsPerPage);
                  setPage(1);
                  if (serverSide && onRowsPerPageChange) {
                    onRowsPerPageChange(newRowsPerPage);
                  }
                } else {
                  const newRowsPerPage = parseInt(value);
                  setRowsPerPage(newRowsPerPage);
                  setPage(1);
                  if (serverSide && onRowsPerPageChange) {
                    onRowsPerPageChange(newRowsPerPage);
                  }
                }
              }}
              classNames={{
                base: "w-20",
                trigger: "bg-white h-9 min-h-0 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200",
                value: "text-sm font-semibold text-gray-700",
                selectorIcon: "text-gray-500",
                popoverContent: "bg-white rounded-xl shadow-2xl border border-gray-100",
              }}
            >
              {selectItems.map((item) => (
                <SelectItem key={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6 py-4 relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-semibold text-gray-700">Memuat data...</p>
            </div>
          </div>
        )}

        <Table
          aria-label="Data Table"
          removeWrapper
          classNames={{
            base: "min-w-full border-t border-gray-200",
            table: "min-w-full",
            thead: "[&>tr]:bg-gradient-to-b [&>tr]:from-gray-50 [&>tr]:to-gray-100/80",
            th: "bg-transparent text-gray-700 font-bold text-xs uppercase tracking-wider border-b-2 border-gray-300 px-5 py-4 first:pl-6 last:pr-6 shadow-sm",
            td: "text-sm text-gray-700 px-5 py-4 first:pl-6 last:pr-6",
            tr: "border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-blue-50/30 hover:to-transparent hover:shadow-sm transition-all duration-200 [&:nth-child(odd)]:bg-gray-50/30",
          }}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn
                key={column.key}
                align={column.align || "start"}
                style={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.sortable ? (
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none hover:text-blue-600 transition-colors group"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.headerRender ? column.headerRender() : column.label}
                    <div className="flex flex-col opacity-60 group-hover:opacity-100 transition-opacity">
                      <svg
                        className={`w-3 h-3 -mb-1 transition-colors ${sortColumn === column.key && sortDirection === "asc" ? "text-blue-600" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" />
                      </svg>
                      <svg
                        className={`w-3 h-3 -mt-1 transition-colors ${sortColumn === column.key && sortDirection === "desc" ? "text-blue-600" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  column.headerRender ? column.headerRender() : column.label
                )}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody
            emptyContent="Tidak ada data yang ditemukan"
          >
            {paginatedData.map((item, index) => {
              // Calculate global index for row numbering
              const globalIndex = (page - 1) * rowsPerPage + index;
              return (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.align === "center" ? "text-center" : column.align === "end" ? "text-right" : ""}>
                      {column.render ? column.render(item, globalIndex) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer - Modern Design */}
      <div className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 ${!noWrapper ? 'rounded-b-2xl' : 'rounded-b-xl'}`}>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-center">
          {/* Info */}
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">
            Menampilkan{" "}
            <span className="font-bold text-blue-600">
              {totalDataCount === 0 ? 0 : (page - 1) * rowsPerPage + 1}
            </span>
            {" - "}
            <span className="font-bold text-blue-600">
              {Math.min(page * rowsPerPage, totalDataCount)}
            </span>
            {" dari "}
            <span className="font-bold text-blue-600">{totalDataCount.toLocaleString('id-ID')}</span> data
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              page={page}
              onChange={(newPage) => {
                setPage(newPage);
                if (serverSide && onPageChange) {
                  onPageChange(newPage);
                }
              }}
              size="sm"
              showControls
              classNames={{
                wrapper: "gap-0.5 sm:gap-1 md:gap-1.5",
                item: "min-w-6 w-6 h-6 sm:min-w-7 sm:w-7 sm:h-7 md:min-w-8 md:w-8 md:h-8 text-[10px] sm:text-xs bg-white border border-gray-200 font-semibold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 rounded-md sm:rounded-lg shadow-sm",
                cursor: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl border-0 rounded-md sm:rounded-lg scale-105",
                prev: "min-w-6 w-6 h-6 sm:min-w-7 sm:w-7 sm:h-7 md:min-w-8 md:w-8 md:h-8 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 rounded-md sm:rounded-lg shadow-sm transition-all duration-200",
                next: "min-w-6 w-6 h-6 sm:min-w-7 sm:w-7 sm:h-7 md:min-w-8 md:w-8 md:h-8 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 rounded-md sm:rounded-lg shadow-sm transition-all duration-200",
              }}
            />
          )}
        </div>
      </div>
    </>
  );

  if (noWrapper) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {content}
    </motion.div>
  );
}
