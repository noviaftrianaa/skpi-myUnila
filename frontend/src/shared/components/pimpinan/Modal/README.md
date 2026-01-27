# Custom Modal Component

Modal component yang dibangun menggunakan framer-motion, reusable untuk seluruh route pimpinan.

## Fitur

- ✅ Animasi smooth menggunakan framer-motion
- ✅ Backdrop dengan blur effect
- ✅ Close on backdrop click (opsional)
- ✅ Close on ESC key (opsional)
- ✅ Responsive sizing (sm, md, lg, xl, 2xl, full)
- ✅ Prevent body scroll saat modal open
- ✅ Support untuk title, subtitle, dan icon
- ✅ Sub-komponen: ModalBody, ModalFooter, ModalSection

## Import

```tsx
import Modal from "@/shared/components/pimpinan/Modal";
// atau
import { Modal, ModalBody, ModalFooter } from "@/shared/components/pimpinan/Modal";
```

## Penggunaan Dasar

```tsx
import { useState } from "react";
import Modal from "@/shared/components/pimpinan/Modal";
import { Button } from "@heroui/react";

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Judul Modal"
        subtitle="Deskripsi modal"
      >
        <p>Konten modal di sini</p>
      </Modal>
    </>
  );
}
```

## Dengan Icon

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Judul Modal"
  titleIcon={<FiAward className="w-5 h-5" />}
  subtitle="Deskripsi modal"
>
  <p>Konten modal di sini</p>
</Modal>
```

## Ukuran Modal

```tsx
// sm: max-w-sm
<Modal size="sm" ... />

// md: max-w-md (default)
<Modal size="md" ... />

// lg: max-w-lg
<Modal size="lg" ... />

// xl: max-w-xl
<Modal size="xl" ... />

// 2xl: max-w-2xl
<Modal size="2xl" ... />

// full: max-w-full dengan margin
<Modal size="full" ... />
```

## Tanpa Close Button

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Judul Modal"
  showCloseButton={false}
>
  <p>Konten modal di sini</p>
</Modal>
```

## Tanpa Close on Backdrop Click

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Judul Modal"
  closeOnBackdropClick={false}
>
  <p>Konten modal di sini</p>
</Modal>
```

## Dengan ModalBody dan ModalFooter

```tsx
import { Modal, ModalBody, ModalFooter } from "@/shared/components/pimpinan/Modal";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Konfirmasi"
>
  <ModalBody>
    <p>Apakah Anda yakin ingin melanjutkan tindakan ini?</p>
  </ModalBody>

  <ModalFooter>
    <Button variant="flat" onPress={() => setIsOpen(false)}>
      Batal
    </Button>
    <Button color="primary" onPress={handleConfirm}>
      Konfirmasi
    </Button>
  </ModalFooter>
</Modal>
```

## Props

### Modal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | - | **Required.** Menentukan apakah modal ditampilkan |
| onClose | () => void | - | **Required.** Callback ketika modal ditutup |
| title | string | - | Judul modal |
| titleIcon | ReactNode | - | Icon di sebelah judul |
| subtitle | string | - | Subtitle/deskripsi di bawah judul |
| children | ReactNode | - | **Required.** Konten modal |
| size | "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "full" | "md" | Ukuran modal |
| showCloseButton | boolean | true | Menampilkan tombol close |
| closeOnBackdropClick | boolean | true | Menutup modal ketika klik backdrop |
| closeOnEscape | boolean | true | Menutup modal ketika tekan ESC |
| backdropClassName | string | - | Custom className untuk backdrop |
| className | string | - | Custom className untuk modal content |

### ModalBody

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | **Required.** Konten body |
| className | string | - | Custom className |

### ModalFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | **Required.** Konten footer (biasanya tombol) |
| className | string | - | Custom className |

### ModalSection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | **Required.** Konten section |
| className | string | - | CustomClassName |

## Contoh Penggunaan di Akreditasi

Lihat file `HistoryModal.tsx` untuk contoh implementasi lengkap:

```tsx
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
      {/* Konten history */}
    </Modal>
  );
};
```
