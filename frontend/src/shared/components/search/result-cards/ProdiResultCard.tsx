"use client";

import { motion } from "framer-motion";
import { Card, CardBody, Chip } from "@heroui/react";
import Link from "next/link";

export interface ProdiResult {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
  fakultas: string;
  akreditasi: string;
  total_mahasiswa: number;
  total_dosen?: number;
  relevance_score: number;
  highlight?: {
    nama_prodi?: string;
    fakultas?: string;
  };
}

interface ProdiResultCardProps {
  result: ProdiResult;
}

export default function ProdiResultCard({ result }: ProdiResultCardProps) {
  const getAkreditasiColor = (akreditasi: string) => {
    switch (akreditasi.toUpperCase()) {
      case "A":
      case "UNGGUL":
        return "success";
      case "B":
      case "BAIK SEKALI":
        return "primary";
      case "C":
      case "BAIK":
        return "warning";
      default:
        return "default";
    }
  };

  const getJenjangIcon = (jenjang: string) => {
    const j = jenjang.toLowerCase();
    if (j.includes("s3") || j.includes("doktor")) return "🎓🎓🎓";
    if (j.includes("s2") || j.includes("magister")) return "🎓🎓";
    if (j.includes("s1")) return "🎓";
    if (j.includes("d3") || j.includes("d4")) return "📚";
    return "🎓";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/program-studi/${result.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardBody className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Chip size="sm" color="primary" variant="flat" className="mb-2">
                  🎓 Program Studi
                </Chip>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {(result.relevance_score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Program Studi Name */}
            <div className="mb-3">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{getJenjangIcon(result.jenjang)}</span>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-bold text-gray-900 mb-1"
                    dangerouslySetInnerHTML={{
                      __html: result.highlight?.nama_prodi || result.nama_prodi,
                    }}
                  />
                  <p
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: result.highlight?.fakultas || result.fakultas,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metadata Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Chip size="sm" variant="flat">
                {result.jenjang}
              </Chip>
              <Chip size="sm" variant="flat">
                Kode: {result.kode_prodi}
              </Chip>
              <Chip
                size="sm"
                color={getAkreditasiColor(result.akreditasi)}
                variant="flat"
              >
                Akreditasi {result.akreditasi}
              </Chip>
            </div>

            {/* Statistics */}
            <div className="flex gap-4 text-sm border-t border-gray-200 pt-3">
              <div>
                <span className="text-gray-500">Mahasiswa:</span>
                <span className="font-semibold text-gray-900 ml-1">
                  {result.total_mahasiswa.toLocaleString()}
                </span>
              </div>
              {result.total_dosen && (
                <>
                  <span className="text-gray-300">|</span>
                  <div>
                    <span className="text-gray-500">Dosen:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {result.total_dosen}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
