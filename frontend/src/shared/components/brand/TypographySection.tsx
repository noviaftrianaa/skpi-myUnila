"use client";

import { Card, CardBody } from "@heroui/react";

export default function TypographySection() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Typography</h2>
        <p className="text-gray-600">
          Poppins adalah font utama yang digunakan untuk semua elemen text di myUnila.
        </p>
      </div>

      {/* Logo Font Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-myunila rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">i</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">Font Logo myUnila</h4>
            <p className="text-sm text-gray-700">
              Logo myUnila menggunakan <strong>Poppins Bold (700)</strong> dengan warna <code className="bg-white px-2 py-0.5 rounded text-myunila font-semibold">#0B5EA8</code>.
              Pastikan menggunakan font weight yang sama saat mereproduksi logo.
            </p>
          </div>
        </div>
      </div>

      {/* Font Family */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Font Family</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Primary Font</h4>
              <p className="text-4xl font-poppins mb-2">Poppins</p>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                font-family: 'Poppins', sans-serif
              </code>
            </div>
            <div className="pt-4 border-t">
              <p className="text-gray-600 text-sm mb-2">Font Weights:</p>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="font-normal text-lg">Regular (400)</p>
                  <code className="text-xs">font-normal</code>
                </div>
                <div>
                  <p className="font-medium text-lg">Medium (500)</p>
                  <code className="text-xs">font-medium</code>
                </div>
                <div>
                  <p className="font-semibold text-lg">Semibold (600)</p>
                  <code className="text-xs">font-semibold</code>
                </div>
                <div>
                  <p className="font-bold text-lg">Bold (700)</p>
                  <code className="text-xs">font-bold</code>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Heading Styles */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Heading Styles</h3>
          <div className="space-y-4">
            <div className="flex items-baseline gap-4 pb-3 border-b">
              <h1 className="text-5xl md:text-6xl font-bold">Heading 1</h1>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-5xl md:text-6xl font-bold
              </code>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b">
              <h2 className="text-4xl md:text-5xl font-bold">Heading 2</h2>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-4xl md:text-5xl font-bold
              </code>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b">
              <h3 className="text-3xl md:text-4xl font-bold">Heading 3</h3>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-3xl md:text-4xl font-bold
              </code>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b">
              <h4 className="text-2xl md:text-3xl font-bold">Heading 4</h4>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-2xl md:text-3xl font-bold
              </code>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b">
              <h5 className="text-xl md:text-2xl font-bold">Heading 5</h5>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-xl md:text-2xl font-bold
              </code>
            </div>
            <div className="flex items-baseline gap-4">
              <h6 className="text-lg md:text-xl font-bold">Heading 6</h6>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                text-lg md:text-xl font-bold
              </code>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Body Text */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Body Text</h3>
          <div className="space-y-4">
            <div className="pb-3 border-b">
              <p className="text-xl mb-2">
                Body XL - Digunakan untuk lead paragraf atau text penting
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-xl</code>
            </div>
            <div className="pb-3 border-b">
              <p className="text-lg mb-2">
                Body Large - Digunakan untuk konten utama yang menonjol
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-lg</code>
            </div>
            <div className="pb-3 border-b">
              <p className="text-base mb-2">
                Body Regular - Ukuran default untuk konten utama dan paragraf
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-base</code>
            </div>
            <div className="pb-3 border-b">
              <p className="text-sm mb-2">
                Body Small - Untuk keterangan, caption, atau informasi sekunder
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-sm</code>
            </div>
            <div>
              <p className="text-xs mb-2">
                Body XS - Untuk metadata, timestamp, atau text sangat kecil
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-xs</code>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Text Colors */}
      <Card className="border border-gray-200">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Text Colors</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-gray-900 font-medium flex-1">Primary Text (Gray 900)</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-gray-900</code>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-gray-700 font-medium flex-1">Secondary Text (Gray 700)</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-gray-700</code>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-gray-600 font-medium flex-1">Tertiary Text (Gray 600)</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-gray-600</code>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-gray-500 font-medium flex-1">Disabled Text (Gray 500)</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-gray-500</code>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-myunila font-medium flex-1">Brand Text (myUnila)</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">text-myunila</code>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
