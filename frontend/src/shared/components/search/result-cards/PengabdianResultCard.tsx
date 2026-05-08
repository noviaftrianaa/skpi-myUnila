"use client";

import { motion } from "framer-motion";
import { sanitizeHighlight } from "@/shared/utils/sanitizeHighlight";
import { Card, CardBody, Chip, Avatar, AvatarGroup } from "@heroui/react";
import Link from "next/link";

export interface PengabdianResult {
  id: string;
  judul: string;
  tahun: number;
  pelaksana: Array<{
    id: string;
    nama: string;
    foto_url?: string;
  }>;
  skema: string;
  status: string;
  lokasi?: string;
  mitra?: string;
  relevance_score: number;
  highlight?: {
    judul?: string;
    pelaksana?: string;
    skema?: string;
    lokasi?: string;
  };
}

interface PengabdianResultCardProps {
  result: PengabdianResult;
}

export default function PengabdianResultCard({ result }: PengabdianResultCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "selesai":
        return "success";
      case "berjalan":
        return "primary";
      case "disetujui":
        return "warning";
      case "ditolak":
        return "danger";
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
      <Link href={`/pengabdian/${result.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardBody className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <Chip size="sm" color="primary" variant="flat">
                🤝 Pengabdian
              </Chip>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(result.relevance_score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeHighlight(result.highlight?.judul || result.judul),
              }}
            />

            {/* Pelaksana */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <AvatarGroup size="sm" max={3}>
                  {result.pelaksana.slice(0, 3).map((pelaksana) => (
                    <Avatar
                      key={pelaksana.id}
                      src={pelaksana.foto_url}
                      name={pelaksana.nama}
                      size="sm"
                    />
                  ))}
                </AvatarGroup>
              </div>
              <p className="text-sm text-gray-600">
                {result.pelaksana.length === 1 ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHighlight(result.highlight?.pelaksana || result.pelaksana[0].nama),
                    }}
                  />
                ) : (
                  <>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHighlight(result.highlight?.pelaksana || result.pelaksana[0].nama),
                      }}
                    />
                    {result.pelaksana.length > 1 && (
                      <span className="text-gray-500">
                        {" "}
                        dan {result.pelaksana.length - 1} pelaksana lainnya
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Metadata Chips */}
            <div className="flex flex-wrap gap-2">
              <Chip size="sm" variant="flat" color="warning">
                {result.tahun}
              </Chip>
              <Chip
                size="sm"
                color={getStatusColor(result.status)}
                variant="flat"
              >
                {result.status}
              </Chip>
              <Chip
                size="sm"
                variant="dot"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHighlight(result.highlight?.skema || result.skema),
                }}
              />
              {result.lokasi && (
                <Chip
                  size="sm"
                  variant="dot"
                  className="text-xs"
                  dangerouslySetInnerHTML={{
                    __html: result.highlight?.lokasi || `📍 ${result.lokasi}`,
                  }}
                />
              )}
              {result.mitra && (
                <Chip size="sm" variant="dot" className="text-xs">
                  Mitra: {result.mitra}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
