import { Card, CardBody, Chip, Badge } from "@heroui/react";
import { FiClock, FiAward, FiFileText, FiCalendar } from "react-icons/fi";
import { type AkreditasiHistory } from "@/lib/services/executive";
import { formatDate, getAkreditasiBadgeColor } from "./utils";
import Modal from "../Modal";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prodiName: string;
  jenjang: string;
  history: AkreditasiHistory[];
}

export const HistoryModal = ({
  isOpen,
  onClose,
  prodiName,
  jenjang,
  history,
}: HistoryModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="History Akreditasi"
      titleIcon={<FiClock className="w-5 h-5" />}
      subtitle={`${prodiName} (${jenjang})`}
    >
      {history && history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item, index) => (
            <Card
              key={index}
              className={`${
                index === 0
                  ? "border-2 border-primary shadow-lg"
                  : "border border-gray-200"
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">
                      {item.nilai_akreditasi}
                    </span>
                    {index === 0 && (
                      <Chip size="sm" color="primary" variant="flat">
                        Terbaru
                      </Chip>
                    )}
                  </div>
                  <Badge
                    color={getAkreditasiBadgeColor(item.nilai_akreditasi)}
                    content={item.nilai_akreditasi}
                    shape="circle"
                  >
                    <div className="w-6 h-6" />
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <FiFileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Nomor SK:</p>
                      <p className="font-medium">{item.sk_akreditasi || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Lembaga Akreditasi:</p>
                      <p className="font-medium">
                        {item.lembaga_akreditasi || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Tanggal SK:</p>
                      <p className="font-medium">
                        {formatDate(item.tanggal_sk)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Masa Berlaku Hingga:</p>
                      <p className="font-medium">
                        {formatDate(item.tanggal_kadaluarsa)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <FiClock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada history akreditasi</p>
        </div>
      )}
    </Modal>
  );
};
