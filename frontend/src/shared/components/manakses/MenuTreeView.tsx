"use client";

import { useState } from "react";
import { Button, Chip, Tooltip, Spinner } from "@heroui/react";
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiEye, FiEyeOff, FiUsers, FiFile } from "react-icons/fi";
import { type Menu } from "@/lib/services/manakses/menuService";

interface MenuTreeViewProps {
  menus: Menu[];
  loading?: boolean;
  onEdit?: (menu: Menu) => void;
  onDelete?: (menu: Menu) => void;
  onViewRoles?: (menu: Menu) => void;
  onAdd?: (parentMenu?: Menu) => void;
  readOnly?: boolean;
}

interface MenuNodeProps {
  menu: Menu;
  level: number;
  onEdit?: (menu: Menu) => void;
  onDelete?: (menu: Menu) => void;
  onViewRoles?: (menu: Menu) => void;
  onAdd?: (parentMenu?: Menu) => void;
  readOnly?: boolean;
}

function MenuNode({ menu, level, onEdit, onDelete, onViewRoles, onAdd, readOnly }: MenuNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = menu.children && menu.children.length > 0;

  const getLevelColor = (lvl: number) => {
    const colors = [
      "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30",
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30",
      "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30",
      "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/30",
    ];
    return colors[lvl % colors.length];
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getLevelColor(level)} hover:shadow-sm transition-all group`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
            hasChildren ? "hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" : "cursor-default"
          }`}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <FiChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )
          ) : (
            <FiFile className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          )}
        </button>

        {/* Menu Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
              {menu.nm_menu}
            </span>
            {menu.icon && (
              <Tooltip content={`Icon: ${menu.icon}`}>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  [{menu.icon}]
                </span>
              </Tooltip>
            )}
          </div>
          {menu.nm_file && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {menu.nm_file}
            </div>
          )}
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5">
          <Tooltip content={menu.a_aktif ? "Menu Aktif" : "Menu Non-Aktif"}>
            <Chip
              size="sm"
              variant="flat"
              color={menu.a_aktif ? "success" : "danger"}
              className="h-5 text-[10px] px-1.5"
            >
              {menu.a_aktif ? "Aktif" : "Off"}
            </Chip>
          </Tooltip>
          <Tooltip content={menu.a_tampil ? "Tampil di Sidebar" : "Tersembunyi"}>
            <span className={`${menu.a_tampil ? "text-blue-500" : "text-gray-400"}`}>
              {menu.a_tampil ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
            </span>
          </Tooltip>
          <Tooltip content={`Urutan: ${menu.urutan_menu}`}>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
              #{menu.urutan_menu}
            </span>
          </Tooltip>
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onViewRoles && (
              <Tooltip content="Lihat Role">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="w-7 h-7 min-w-7"
                  onPress={() => onViewRoles(menu)}
                >
                  <FiUsers className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </Tooltip>
            )}
            {onAdd && (
              <Tooltip content="Tambah Sub-Menu">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="w-7 h-7 min-w-7"
                  onPress={() => onAdd(menu)}
                >
                  <FiPlus className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip content="Edit Menu">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="w-7 h-7 min-w-7"
                  onPress={() => onEdit(menu)}
                >
                  <FiEdit2 className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip content="Hapus Menu">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="w-7 h-7 min-w-7 text-danger"
                  onPress={() => onDelete(menu)}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {menu.children!.map((child) => (
            <MenuNode
              key={child.id_menu}
              menu={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewRoles={onViewRoles}
              onAdd={onAdd}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuTreeView({
  menus,
  loading,
  onEdit,
  onDelete,
  onViewRoles,
  onAdd,
  readOnly = false,
}: MenuTreeViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" color="primary" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Memuat menu...</span>
      </div>
    );
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <FiFile className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Belum ada menu untuk aplikasi ini
        </p>
        {!readOnly && onAdd && (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            className="mt-3"
            startContent={<FiPlus className="w-4 h-4" />}
            onPress={() => onAdd()}
          >
            Tambah Menu
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {menus.map((menu) => (
        <MenuNode
          key={menu.id_menu}
          menu={menu}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewRoles={onViewRoles}
          onAdd={onAdd}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
