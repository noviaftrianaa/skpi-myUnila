"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { endpointService, type Endpoint, type EndpointStats, type EndpointCreateData, type EndpointGroup } from "@/lib/services/manakses/endpointService";
import { toast } from "react-hot-toast";

interface EndpointTableProps {
  onStatsLoaded?: (stats: EndpointStats) => void;
}

export default function EndpointTable({ onStatsLoaded }: EndpointTableProps) {
  const [data, setData] = useState<Endpoint[]>([]);
  const [stats, setStats] = useState<EndpointStats | null>(null);
  const [groups, setGroups] = useState<EndpointGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<Endpoint | null>(null);
  const [formData, setFormData] = useState<EndpointCreateData>({
    nm_endpoint: "",
    path_url: "",
    nm_group: null,
    nm_method: null,
    a_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load stats and groups on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, groupsData] = await Promise.all([
          endpointService.getStats(),
          endpointService.getGroups(),
        ]);
        setStats(statsData);
        setGroups(groupsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await endpointService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          nm_group: filterGroup !== "all" ? filterGroup : undefined,
          nm_method: filterMethod !== "all" ? filterMethod : undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading endpoints:', error);
        toast.error('Gagal memuat data endpoint');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterGroup, filterMethod]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getMethodColor = (method: string | null): "primary" | "success" | "warning" | "danger" | "default" => {
    switch (method?.toUpperCase()) {
      case "GET": return "primary";
      case "POST": return "success";
      case "PUT": return "warning";
      case "PATCH": return "warning";
      case "DELETE": return "danger";
      default: return "default";
    }
  };

  const handleAdd = () => {
    setFormData({
      nm_endpoint: "",
      path_url: "",
      nm_group: null,
      nm_method: null,
      a_active: true,
    });
    onAddOpen();
  };

  const handleEdit = (item: Endpoint) => {
    setSelectedItem(item);
    setFormData({
      nm_endpoint: item.nm_endpoint,
      path_url: item.path_url,
      nm_group: item.nm_group,
      nm_method: item.nm_method,
      a_active: item.a_active,
    });
    onEditOpen();
  };

  const handleDelete = (item: Endpoint) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleSubmitAdd = async () => {
    if (!formData.nm_endpoint.trim()) {
      toast.error('Nama endpoint harus diisi');
      return;
    }
    if (!formData.path_url.trim()) {
      toast.error('Path URL harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await endpointService.create(formData);
      toast.success('Endpoint berhasil ditambahkan');
      onAddClose();
      setCurrentPage(1);
      // Reload stats
      const statsData = await endpointService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error('Error creating endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan endpoint';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem) return;
    if (!formData.nm_endpoint.trim()) {
      toast.error('Nama endpoint harus diisi');
      return;
    }
    if (!formData.path_url.trim()) {
      toast.error('Path URL harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await endpointService.update(selectedItem.id_endpoint, formData);
      toast.success('Endpoint berhasil diperbarui');
      onEditClose();
      // Reload data
      const response = await endpointService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        nm_group: filterGroup !== "all" ? filterGroup : undefined,
        nm_method: filterMethod !== "all" ? filterMethod : undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error('Error updating endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui endpoint';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await endpointService.delete(selectedItem.id_endpoint);
      toast.success('Endpoint berhasil dihapus');
      onDeleteClose();
      // Reload data
      const response = await endpointService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        nm_group: filterGroup !== "all" ? filterGroup : undefined,
        nm_method: filterMethod !== "all" ? filterMethod : undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
      // Reload stats
      const statsData = await endpointService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error('Error deleting endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus endpoint';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Endpoint>[] = [
    {
      key: "nm_endpoint",
      label: "NAMA ENDPOINT",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_endpoint}
        </div>
      ),
    },
    {
      key: "path_url",
      label: "PATH URL",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate max-w-xs">
          {item.path_url}
        </div>
      ),
    },
    {
      key: "nm_method",
      label: "METHOD",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={getMethodColor(item.nm_method)}
        >
          {item.nm_method || "-"}
        </Chip>
      ),
    },
    {
      key: "nm_group",
      label: "GROUP",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
          {item.nm_group || "-"}
        </div>
      ),
    },
    {
      key: "a_active",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_active ? "success" : "danger"}
        >
          {item.a_active ? "Aktif" : "Tidak Aktif"}
        </Chip>
      ),
    },
    {
      key: "last_update",
      label: "TERAKHIR UPDATE",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_update)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={() => handleEdit(item)}
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDelete(item)}
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-3 w-full flex-wrap">
      <Select
        aria-label="Filter Group"
        placeholder="Semua Group"
        selectedKeys={[filterGroup]}
        onChange={(e) => {
          setFilterGroup(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full max-w-[180px]",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200",
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all">
          Semua Group
        </SelectItem>
        {groups.map((group) => (
          <SelectItem key={group.nm_group} value={group.nm_group}>
            {group.nm_group} ({group.total})
          </SelectItem>
        ))}
      </Select>
      <Select
        aria-label="Filter Method"
        placeholder="Semua Method"
        selectedKeys={[filterMethod]}
        onChange={(e) => {
          setFilterMethod(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full max-w-[150px]",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200",
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all">Semua Method</SelectItem>
        <SelectItem key="GET" value="GET">GET ({stats?.total_get || 0})</SelectItem>
        <SelectItem key="POST" value="POST">POST ({stats?.total_post || 0})</SelectItem>
        <SelectItem key="PUT" value="PUT">PUT ({stats?.total_put || 0})</SelectItem>
        <SelectItem key="DELETE" value="DELETE">DELETE ({stats?.total_delete || 0})</SelectItem>
      </Select>
      <Button
        color="primary"
        startContent={<FiPlus className="w-4 h-4" />}
        onPress={handleAdd}
        size="sm"
      >
        Tambah Endpoint
      </Button>
    </div>
  );

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable={true}
            searchKeys={["nm_endpoint", "path_url", "nm_group"]}
            searchPlaceholder="Cari nama endpoint atau path..."
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            loading={loading}
            serverSide={true}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
            filterSlot={filterSlot}
            className="shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalContent>
          <ModalHeader>Tambah Endpoint</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Endpoint"
                placeholder="Masukkan nama endpoint"
                value={formData.nm_endpoint}
                onChange={(e) => setFormData({ ...formData, nm_endpoint: e.target.value })}
                isRequired
              />
              <Input
                label="Path URL"
                placeholder="/api/v1/example"
                value={formData.path_url}
                onChange={(e) => setFormData({ ...formData, path_url: e.target.value })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Group"
                  placeholder="Nama group"
                  value={formData.nm_group || ""}
                  onChange={(e) => setFormData({ ...formData, nm_group: e.target.value || null })}
                />
                <Select
                  label="Method"
                  placeholder="Pilih method"
                  selectedKeys={formData.nm_method ? [formData.nm_method] : []}
                  onChange={(e) => setFormData({ ...formData, nm_method: e.target.value || null })}
                >
                  <SelectItem key="GET" value="GET">GET</SelectItem>
                  <SelectItem key="POST" value="POST">POST</SelectItem>
                  <SelectItem key="PUT" value="PUT">PUT</SelectItem>
                  <SelectItem key="PATCH" value="PATCH">PATCH</SelectItem>
                  <SelectItem key="DELETE" value="DELETE">DELETE</SelectItem>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Aktif</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Endpoint ini aktif dan dapat diakses
                  </p>
                </div>
                <Switch
                  isSelected={formData.a_active}
                  onValueChange={(value) => setFormData({ ...formData, a_active: value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>Batal</Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader>Edit Endpoint</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Endpoint"
                placeholder="Masukkan nama endpoint"
                value={formData.nm_endpoint}
                onChange={(e) => setFormData({ ...formData, nm_endpoint: e.target.value })}
                isRequired
              />
              <Input
                label="Path URL"
                placeholder="/api/v1/example"
                value={formData.path_url}
                onChange={(e) => setFormData({ ...formData, path_url: e.target.value })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Group"
                  placeholder="Nama group"
                  value={formData.nm_group || ""}
                  onChange={(e) => setFormData({ ...formData, nm_group: e.target.value || null })}
                />
                <Select
                  label="Method"
                  placeholder="Pilih method"
                  selectedKeys={formData.nm_method ? [formData.nm_method] : []}
                  onChange={(e) => setFormData({ ...formData, nm_method: e.target.value || null })}
                >
                  <SelectItem key="GET" value="GET">GET</SelectItem>
                  <SelectItem key="POST" value="POST">POST</SelectItem>
                  <SelectItem key="PUT" value="PUT">PUT</SelectItem>
                  <SelectItem key="PATCH" value="PATCH">PATCH</SelectItem>
                  <SelectItem key="DELETE" value="DELETE">DELETE</SelectItem>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Aktif</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Endpoint ini aktif dan dapat diakses
                  </p>
                </div>
                <Switch
                  isSelected={formData.a_active}
                  onValueChange={(value) => setFormData({ ...formData, a_active: value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>Batal</Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p>Apakah Anda yakin ingin menghapus endpoint <strong>{selectedItem?.nm_endpoint}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">Path: {selectedItem?.path_url}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>Batal</Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
