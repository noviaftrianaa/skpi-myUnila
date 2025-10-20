'use client';

import { useEffect, useState } from 'react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { dashboardService } from '@/lib/services/dashboard.service';
import type { Dosen } from '@/lib/types/dashboard.types';
import DataTable, { Column } from '@/shared/components/ui/DataTable';

interface DosenTableProps {
  programStudiId: string;
}

export default function DosenTable({ programStudiId }: DosenTableProps) {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDosenByProgramStudi(programStudiId);

        if (response.success) {
          setDosenList(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching dosen list:', err);
        setError('Gagal memuat daftar dosen');
      } finally {
        setLoading(false);
      }
    };

    if (programStudiId) {
      fetchDosen();
    }
  }, [programStudiId]);

  if (error) {
    return (
      <div className="border-2 border-red-200 rounded-xl p-8 text-center bg-red-50">
        <div className="text-4xl mb-4">⚠️</div>
        <h4 className="font-bold text-gray-800 mb-2">Gagal Memuat Data</h4>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (!loading && dosenList.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h4 className="font-bold text-gray-800 mb-2">Belum Ada Data Dosen</h4>
        <p className="text-sm text-gray-600">
          Belum ada dosen yang terdaftar di program studi ini
        </p>
      </div>
    );
  }

  const columns: Column<Dosen>[] = [
    {
      key: 'no',
      label: 'NO',
      width: '60px',
      align: 'center',
      render: (item, index) => {
        return <span className="font-medium text-gray-700">{(index ?? 0) + 1}</span>;
      },
    },
    {
      key: 'nama',
      label: 'NAMA DOSEN',
      minWidth: '200px',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-gray-900">{item.nama}</div>
      ),
    },
    {
      key: 'nidn',
      label: 'NIDN',
      width: '130px',
      sortable: true,
      render: (item) => (
        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
          {item.nidn}
        </code>
      ),
    },
    {
      key: 'nip',
      label: 'NIP',
      width: '150px',
      sortable: true,
      render: (item) => (
        <code className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs font-mono">
          {item.nip}
        </code>
      ),
    },
    {
      key: 'jenis_kelamin',
      label: 'JK',
      width: '60px',
      align: 'center',
      render: (item) => (
        <>
          {item.jenis_kelamin === 'Laki-laki' ? (
            <FaMale className="inline text-blue-600 text-lg" title="Laki-laki" />
          ) : item.jenis_kelamin === 'Perempuan' ? (
            <FaFemale className="inline text-pink-600 text-lg" title="Perempuan" />
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </>
      ),
    },
    {
      key: 'jabatan_fungsional',
      label: 'JABATAN FUNGSIONAL',
      minWidth: '160px',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {item.jabatan_fungsional}
        </span>
      ),
    },
    {
      key: 'pendidikan_terakhir',
      label: 'PENDIDIKAN',
      width: '110px',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.pendidikan_terakhir}
        </span>
      ),
    },
    {
      key: 'status_keaktifan',
      label: 'STATUS',
      width: '120px',
      render: (item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          item.status_keaktifan.status === 'Aktif'
            ? 'bg-green-100 text-green-800'
            : item.status_keaktifan.status === 'Tidak Aktif'
            ? 'bg-red-100 text-red-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {item.status_keaktifan.status}
        </span>
      ),
    },
    {
      key: 'ikatan_kerja',
      label: 'IKATAN KERJA',
      width: '130px',
      render: (item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          item.ikatan_kerja.status === 'Dosen Tetap'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {item.ikatan_kerja.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={dosenList}
      columns={columns}
      searchable={true}
      searchKeys={['nama', 'nidn', 'nip']}
      searchPlaceholder="Cari nama dosen, NIDN, atau NIP..."
      defaultRowsPerPage={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      loading={loading}
      noWrapper={true}
      onPageChange={(page) => setCurrentPage(page)}
      onRowsPerPageChange={(rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1);
      }}
    />
  );
}
