"use client";

import { motion } from "framer-motion";
import { sanitizeHighlight } from "@/shared/utils/sanitizeHighlight";
import { Card, CardBody, Chip, Avatar } from "@heroui/react";
import Link from "next/link";

export interface MahasiswaResult {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  fakultas: string;
  angkatan: number;
  status: string;
  email?: string;
  foto_url?: string;
  relevance_score: number;
  highlight?: {
    nama?: string;
    nim?: string;
    prodi?: string;
  };
}

interface MahasiswaResultCardProps {
  result: MahasiswaResult;
}

export default function MahasiswaResultCard({ result }: MahasiswaResultCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aktif":
        return "success";
      case "cuti":
        return "warning";
      case "non-aktif":
      case "lulus":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/mahasiswa/${result.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar
                src={result.foto_url}
                name={result.nama}
                size="lg"
                className="flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <Chip size="sm" color="primary" variant="flat" className="mb-2">
                      👨‍🎓 Mahasiswa
                    </Chip>
                    <h3
                      className="text-lg font-bold text-gray-900 mb-1"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHighlight(result.highlight?.nama || result.nama),
                      }}
                    />
                    <p
                      className="text-sm text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHighlight(result.highlight?.nim || `NIM: ${result.nim}`),
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {(result.relevance_score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Program Studi & Fakultas */}
                <div className="mb-3">
                  <p
                    className="text-sm text-gray-700 font-medium"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHighlight(result.highlight?.prodi || result.prodi),
                    }}
                  />
                  <p className="text-xs text-gray-500">{result.fakultas}</p>
                </div>

                {/* Metadata Chips */}
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat">
                    Angkatan {result.angkatan}
                  </Chip>
                  <Chip
                    size="sm"
                    color={getStatusColor(result.status)}
                    variant="flat"
                  >
                    {result.status}
                  </Chip>
                  {result.email && (
                    <Chip size="sm" variant="dot" className="text-xs">
                      {result.email}
                    </Chip>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
