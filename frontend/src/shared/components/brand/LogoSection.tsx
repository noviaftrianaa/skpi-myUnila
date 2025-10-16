"use client";

import { useState } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FiDownload, FiCheck } from "react-icons/fi";
import Image from "next/image";
import Logo from "../common/Logo";

export default function LogoSection() {
  const [downloading, setDownloading] = useState<string | null>(null);

  // Function to generate SVG logo with specific color
  const generateLogoSVG = (color: string, backgroundColor?: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
      ${backgroundColor ? `<rect width="200" height="60" fill="${backgroundColor}"/>` : ''}
      <text x="100" y="40" font-family="Poppins, sans-serif" font-weight="700" font-size="32" fill="${color}" text-anchor="middle">myUnila</text>
    </svg>`;
    return new Blob([svgContent], { type: 'image/svg+xml' });
  };

  // Function to handle logo download with custom SVG generation
  const handleDownload = async (filename: string, color: string, backgroundColor?: string) => {
    setDownloading(filename);

    try {
      let blob: Blob;

      // Generate appropriate blob based on filename
      if (filename === 'logo-unila.png') {
        // For Logo Unila, use existing PNG file
        const response = await fetch('/assets/images/logo-unila.png');
        blob = await response.blob();
      } else {
        // For myUnila logos, generate SVG with appropriate colors
        blob = generateLogoSVG(color, backgroundColor);
      }

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob URL
      window.URL.revokeObjectURL(blobUrl);

      // Show success state
      setTimeout(() => {
        setDownloading(null);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(null);
    }
  };

  const logos = [
    {
      title: "Logo Utama",
      description: "Logo horizontal dengan text myUnila",
      variants: [
        { name: "Color", bg: "bg-white", content: <Logo size="lg" color="text-myunila" /> },
        { name: "White", bg: "bg-myunila", content: <Logo size="lg" color="text-white" /> },
      ]
    },
    {
      title: "Logo Unila",
      description: "Logo Universitas Lampung",
      image: "/assets/images/logo-unila.png",
    }
  ];

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Logo</h2>
        <p className="text-gray-600">
          Logo myUnila adalah identitas visual utama yang merepresentasikan portal terpadu Universitas Lampung.
        </p>
      </div>

      {/* Logo Grid - 2x2 Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Logo myUnila - Background Putih */}
        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Logo myUnila</h3>
            <p className="text-xs text-gray-500 mb-4">Background Putih - Tulisan Biru</p>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex items-center justify-center h-32 mb-4 relative group">
              <Logo size="lg" color="text-myunila" />
              <button
                onClick={() => handleDownload('logo-myunila-putih.svg', '#0B5EA8')}
                disabled={downloading !== null}
                className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  downloading === 'logo-myunila-putih.svg'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-myunila hover:text-white hover:border-myunila shadow-sm'
                }`}
                title="Download SVG - Background Transparan, Tulisan Biru"
              >
                {downloading === 'logo-myunila-putih.svg' ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              SVG • Transparan • <span className="font-semibold text-myunila">#0B5EA8</span>
            </p>
          </CardBody>
        </Card>

        {/* Logo myUnila - Background Biru */}
        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Logo myUnila</h3>
            <p className="text-xs text-gray-500 mb-4">Background Biru - Tulisan Putih</p>

            <div className="bg-myunila rounded-xl p-8 flex items-center justify-center h-32 mb-4 relative group">
              <Logo size="lg" color="text-white" />
              <button
                onClick={() => handleDownload('logo-myunila-biru.svg', '#FFFFFF', '#0B5EA8')}
                disabled={downloading !== null}
                className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  downloading === 'logo-myunila-biru.svg'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-myunila hover:bg-white shadow-sm'
                }`}
                title="Download SVG - Background Biru, Tulisan Putih"
              >
                {downloading === 'logo-myunila-biru.svg' ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              SVG • Background <span className="font-semibold text-myunila">#0B5EA8</span> • Tulisan <span className="font-semibold">#FFFFFF</span>
            </p>
          </CardBody>
        </Card>

        {/* Logo myUnila - Transparan */}
        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Logo myUnila</h3>
            <p className="text-xs text-gray-500 mb-4">Background Transparan - Tulisan Biru</p>

            <div
              className="rounded-xl p-8 flex items-center justify-center h-32 mb-4 relative border-2 border-gray-300 group"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <Logo size="lg" color="text-myunila" />
              <button
                onClick={() => handleDownload('logo-myunila-transparent.svg', '#0B5EA8')}
                disabled={downloading !== null}
                className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  downloading === 'logo-myunila-transparent.svg'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-myunila hover:text-white hover:border-myunila shadow-sm'
                }`}
                title="Download SVG - Background Transparan, Tulisan Biru"
              >
                {downloading === 'logo-myunila-transparent.svg' ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              SVG • <span className="font-semibold text-green-600">Transparan</span> • <span className="font-semibold text-myunila">#0B5EA8</span>
            </p>
          </CardBody>
        </Card>

        {/* Logo Unila */}
        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Logo Unila</h3>
            <p className="text-xs text-gray-500 mb-4">Logo Universitas Lampung</p>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex items-center justify-center h-32 mb-4 relative group">
              <Image
                src="/assets/images/logo-unila.png"
                alt="Logo Unila"
                width={80}
                height={80}
                className="object-contain"
              />
              <button
                onClick={() => handleDownload('logo-unila.png', '')}
                disabled={downloading !== null}
                className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  downloading === 'logo-unila.png'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-myunila hover:text-white hover:border-myunila shadow-sm'
                }`}
                title="Download PNG"
              >
                {downloading === 'logo-unila.png' ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              PNG • 1024x1024px • Resolusi Tinggi
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Logo Specifications */}
      <Card className="border border-gray-200 mt-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Spesifikasi Logo myUnila</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Format:</span>
                <span>SVG (Vector)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Background:</span>
                <span className="text-green-600 font-semibold">✓ Transparan</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Warna Primer:</span>
                <span className="font-mono">#0B5EA8</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Font Logo:</span>
                <span className="font-semibold">Poppins Bold</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Logo Usage Guidelines */}
      <Card className="border border-gray-200 mt-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Panduan Penggunaan Logo</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                <span className="text-2xl">✓</span> DO - Boleh
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Gunakan logo pada background putih atau biru</li>
                <li>• Pertahankan proporsi logo (jangan distorsi)</li>
                <li>• Berikan ruang kosong minimal 20px di sekeliling logo</li>
                <li>• Gunakan file format asli (SVG/PNG)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                <span className="text-2xl">✗</span> DON'T - Jangan
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Jangan mengubah warna logo</li>
                <li>• Jangan merotasi atau membalik logo</li>
                <li>• Jangan menambahkan efek (shadow, outline, dll)</li>
                <li>• Jangan menggunakan logo dengan resolusi rendah</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
