"use client";

import { motion } from "framer-motion";
import { Card, CardBody, Chip } from "@heroui/react";
import Link from "next/link";

export interface PublikasiResult {
  id: string;
  judul: string;
  tahun: number;
  penulis: string[];
  jenis: "Jurnal" | "Buku" | "Prosiding" | "HaKI";
  publisher?: string;
  quartile?: string;
  issn?: string;
  isbn?: string;
  doi?: string;
  relevance_score: number;
  highlight?: {
    judul?: string;
    penulis?: string;
    publisher?: string;
  };
}

interface PublikasiResultCardProps {
  result: PublikasiResult;
}

export default function PublikasiResultCard({ result }: PublikasiResultCardProps) {
  const getJenisConfig = (jenis: string) => {
    switch (jenis) {
      case "Jurnal":
        return { color: "primary" as const, icon: "📄" };
      case "Buku":
        return { color: "secondary" as const, icon: "📘" };
      case "Prosiding":
        return { color: "warning" as const, icon: "📋" };
      case "HaKI":
        return { color: "success" as const, icon: "©️" };
      default:
        return { color: "default" as const, icon: "📚" };
    }
  };

  const jenisConfig = getJenisConfig(result.jenis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/publikasi/${result.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardBody className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <Chip size="sm" color="primary" variant="flat">
                📚 Publikasi
              </Chip>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(result.relevance_score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: result.highlight?.judul || result.judul,
              }}
            />

            {/* Penulis */}
            <p className="text-sm text-gray-600 mb-3">
              {result.penulis.length === 1 ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: result.highlight?.penulis || result.penulis[0],
                  }}
                />
              ) : (
                <>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: result.highlight?.penulis || result.penulis[0],
                    }}
                  />
                  {result.penulis.length === 2 ? (
                    <span> dan {result.penulis[1]}</span>
                  ) : (
                    <span className="text-gray-500">
                      {" "}et al. ({result.penulis.length} penulis)
                    </span>
                  )}
                </>
              )}
            </p>

            {/* Publisher/Penerbit */}
            {result.publisher && (
              <p
                className="text-sm text-gray-500 mb-3 italic"
                dangerouslySetInnerHTML={{
                  __html: result.highlight?.publisher || result.publisher,
                }}
              />
            )}

            {/* Metadata Chips */}
            <div className="flex flex-wrap gap-2">
              <Chip size="sm" color={jenisConfig.color} variant="flat">
                {jenisConfig.icon} {result.jenis}
              </Chip>
              <Chip size="sm" variant="flat" color="warning">
                {result.tahun}
              </Chip>
              {result.quartile && (
                <Chip size="sm" variant="flat" color="success">
                  Q{result.quartile}
                </Chip>
              )}
              {result.issn && (
                <Chip size="sm" variant="dot" className="text-xs">
                  ISSN: {result.issn}
                </Chip>
              )}
              {result.isbn && (
                <Chip size="sm" variant="dot" className="text-xs">
                  ISBN: {result.isbn}
                </Chip>
              )}
              {result.doi && (
                <Chip size="sm" variant="dot" className="text-xs">
                  DOI: {result.doi}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
