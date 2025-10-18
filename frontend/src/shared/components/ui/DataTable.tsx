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
  Button,
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
  render?: (item: T) => React.ReactNode;
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
    if (serverSide) return data;
    if (!searchValue || searchKeys.length === 0) return data;

    return data.filter((item) =>
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
    if (serverSide) return data; // Server already paginated
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage, data, serverSide]);

  const totalPages = serverSide
    ? Math.ceil((totalRecords || 0) / rowsPerPage)
    : Math.ceil(sortedData.length / rowsPerPage);

  const totalDataCount = serverSide ? (totalRecords || 0) : sortedData.length;

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
      {/* Search & Controls Bar */}
      <div className={`px-4 sm:px-6 py-4 sm:py-5 bg-blue-600 ${!noWrapper ? 'rounded-t-2xl' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
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
                  inputWrapper: "bg-white/95 backdrop-blur-sm shadow-sm h-10 rounded-lg border-0 focus-within:bg-white focus-within:shadow-md transition-all",
                  input: "text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none",
                  clearButton: "text-slate-400 hover:text-slate-600",
                }}
                placeholder={searchPlaceholder}
                size="md"
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
          <div className="lg:col-span-3 flex gap-2 items-center justify-start lg:justify-end">
            <span className="text-white font-semibold text-sm whitespace-nowrap">Tampilkan</span>
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
                trigger: "bg-white h-10 min-h-0 rounded-lg shadow-sm hover:shadow-md transition-all",
                value: "text-sm font-semibold pr-2 text-slate-700",
                selectorIcon: "right-2 text-slate-400",
                popoverContent: "bg-white rounded-lg shadow-xl",
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
      <div className="overflow-x-auto px-6 py-4">
        <Table
          aria-label="Data Table"
          removeWrapper
          classNames={{
            base: "min-w-full",
            table: "min-w-full",
            thead: "[&>tr]:bg-white",
            th: "bg-white text-gray-900 font-bold text-[11px] uppercase tracking-wide border-b-2 border-gray-200 px-4 py-3 first:pl-0 last:pr-0",
            td: "text-xs border-b border-gray-100 px-4 py-3.5 first:pl-0 last:pr-0",
            tr: "hover:bg-blue-50/50 transition-colors duration-150",
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
                    className="flex items-center gap-1 cursor-pointer select-none hover:text-blue-600 transition-colors"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.headerRender ? column.headerRender() : column.label}
                    <div className="flex flex-col">
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
            emptyContent={loading ? "Memuat data..." : "Tidak ada data yang ditemukan"}
            isLoading={loading}
          >
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.align === "center" ? "text-center" : column.align === "end" ? "text-right" : ""}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Info */}
          <div className="text-xs text-gray-600 font-medium">
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
                wrapper: "gap-1.5",
                item: "min-w-8 w-8 h-8 text-xs bg-white border border-gray-300 font-semibold hover:bg-blue-50 hover:border-blue-400 transition-colors rounded-lg",
                cursor: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg border-0 rounded-lg",
                prev: "min-w-8 w-8 h-8 bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-400 rounded-lg",
                next: "min-w-8 w-8 h-8 bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-400 rounded-lg",
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
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
    >
      {content}
    </motion.div>
  );
}
