"use client";

import { motion } from "framer-motion";
import { sanitizeHighlight } from "@/shared/utils/sanitizeHighlight";
import { Card, CardBody, Chip, Avatar, AvatarGroup } from "@heroui/react";
import Link from "next/link";

export interface BidangIlmuResult {
  id: string;
  kode_bidang: string;
  nama_bidang: string;
  deskripsi?: string;
  jumlah_dosen: number;
  dosen: Array<{
    id: string;
    nama: string;
    foto_url?: string;
    prodi?: string;
  }>;
  relevance_score: number;
  highlight?: {
    nama_bidang?: string;
    deskripsi?: string;
    dosen?: string;
  };
}

interface BidangIlmuResultCardProps {
  result: BidangIlmuResult;
}

export default function BidangIlmuResultCard({ result }: BidangIlmuResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/bidang-ilmu/${result.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardBody className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <Chip size="sm" color="primary" variant="flat">
                🧬 Bidang Ilmu
              </Chip>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(result.relevance_score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Nama Bidang Ilmu */}
            <div className="mb-3">
              <h3
                className="text-lg font-bold text-gray-900 mb-1"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHighlight(result.highlight?.nama_bidang || result.nama_bidang),
                }}
              />
              <p className="text-xs text-gray-500">
                Kode: {result.kode_bidang}
              </p>
            </div>

            {/* Deskripsi */}
            {result.deskripsi && (
              <p
                className="text-sm text-gray-600 mb-3 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHighlight(result.highlight?.deskripsi || result.deskripsi),
                }}
              />
            )}

            {/* Dosen dengan keahlian ini */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Dosen dengan keahlian ini:
                </span>
                <Chip size="sm" color="primary" variant="flat">
                  {result.jumlah_dosen} dosen
                </Chip>
              </div>

              {/* Avatar Group + Names */}
              {result.dosen.length > 0 && (
                <div className="space-y-2">
                  <AvatarGroup size="sm" max={5}>
                    {result.dosen.slice(0, 5).map((dosen) => (
                      <Avatar
                        key={dosen.id}
                        src={dosen.foto_url}
                        name={dosen.nama}
                        size="sm"
                      />
                    ))}
                  </AvatarGroup>

                  {/* Dosen names */}
                  <div className="flex flex-wrap gap-1">
                    {result.dosen.slice(0, 3).map((dosen, index) => (
                      <Chip
                        key={dosen.id}
                        size="sm"
                        variant="dot"
                        className="text-xs"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(result.highlight?.dosen && index === 0
                              ? result.highlight.dosen
                              : dosen.nama),
                        }}
                      />
                    ))}
                    {result.dosen.length > 3 && (
                      <Chip size="sm" variant="flat" className="text-xs">
                        +{result.dosen.length - 3} lainnya
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
