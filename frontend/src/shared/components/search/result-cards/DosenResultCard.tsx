"use client";

import { motion } from "framer-motion";
import { Card, CardBody, Chip, Avatar } from "@heroui/react";
import Link from "next/link";

export interface DosenResult {
  id: string;
  id_sdm: string;
  nama: string;
  nidn?: string;
  nuptk: string;
  jabatan_fungsional: string;
  prodi: string;
  fakultas: string;
  bidang_keahlian: string[];
  foto_url?: string;
  email?: string;
  relevance_score: number;
  highlight?: {
    nama?: string;
    nidn?: string;
    prodi?: string;
    bidang_keahlian?: string;
  };
}

interface DosenResultCardProps {
  result: DosenResult;
}

export default function DosenResultCard({ result }: DosenResultCardProps) {
  const getJabatanColor = (jabatan: string) => {
    if (jabatan.toLowerCase().includes("guru besar")) return "danger";
    if (jabatan.toLowerCase().includes("lektor kepala")) return "warning";
    if (jabatan.toLowerCase().includes("lektor")) return "primary";
    return "default";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/dosen/${result.id}`}>
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
                      👨‍🏫 Dosen
                    </Chip>
                    <h3
                      className="text-lg font-bold text-gray-900 mb-1"
                      dangerouslySetInnerHTML={{
                        __html: result.highlight?.nama || result.nama,
                      }}
                    />
                    <div className="flex gap-2 text-sm text-gray-500">
                      {result.nidn && (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: result.highlight?.nidn || `NIDN: ${result.nidn}`,
                          }}
                        />
                      )}
                      <span>•</span>
                      <span>NUPTK: {result.nuptk}</span>
                    </div>
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
                      __html: result.highlight?.prodi || result.prodi,
                    }}
                  />
                  <p className="text-xs text-gray-500">{result.fakultas}</p>
                </div>

                {/* Metadata Chips */}
                <div className="flex flex-wrap gap-2">
                  <Chip
                    size="sm"
                    color={getJabatanColor(result.jabatan_fungsional)}
                    variant="flat"
                  >
                    {result.jabatan_fungsional}
                  </Chip>
                  {result.bidang_keahlian.slice(0, 3).map((bidang, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="dot"
                      dangerouslySetInnerHTML={{
                        __html:
                          result.highlight?.bidang_keahlian &&
                          index === 0
                            ? result.highlight.bidang_keahlian
                            : bidang,
                      }}
                    />
                  ))}
                  {result.bidang_keahlian.length > 3 && (
                    <Chip size="sm" variant="flat" className="text-xs">
                      +{result.bidang_keahlian.length - 3} lainnya
                    </Chip>
                  )}
                </div>

                {result.email && (
                  <p className="text-xs text-gray-500 mt-2">
                    📧 {result.email}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
