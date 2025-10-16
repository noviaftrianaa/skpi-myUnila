"use client";

import { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { FiCopy, FiCheck } from "react-icons/fi";

export default function ColorSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const primaryColors = [
    { name: "Primary", hex: "#0B5EA8", rgb: "11, 94, 168", css: "myunila", usage: "Warna utama brand" },
    { name: "Primary 50", hex: "#E6F2FA", rgb: "230, 242, 250", css: "myunila-50", usage: "Background ringan" },
    { name: "Primary 100", hex: "#CCE5F5", rgb: "204, 229, 245", css: "myunila-100", usage: "Background medium" },
    { name: "Primary 500", hex: "#0B5EA8", rgb: "11, 94, 168", css: "myunila-500", usage: "Warna default" },
    { name: "Primary 700", hex: "#073864", rgb: "7, 56, 100", css: "myunila-700", usage: "Hover state" },
    { name: "Primary 900", hex: "#021220", rgb: "2, 18, 32", css: "myunila-900", usage: "Text dark" },
  ];

  const gradients = [
    {
      name: "Gradient Blue Modern",
      css: "bg-gradient-blue-modern",
      value: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)",
      usage: "Button primary, Hero sections"
    },
    {
      name: "Gradient Ocean",
      css: "bg-gradient-ocean",
      value: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
      usage: "Cards, Special sections"
    },
    {
      name: "Gradient Sky",
      css: "bg-gradient-sky",
      value: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)",
      usage: "Backgrounds, Overlays"
    },
  ];

  const semanticColors = [
    { name: "Success", hex: "#10B981", rgb: "16, 185, 129", usage: "Status berhasil" },
    { name: "Warning", hex: "#F59E0B", rgb: "245, 158, 11", usage: "Peringatan" },
    { name: "Error", hex: "#EF4444", rgb: "239, 68, 68", usage: "Error, Danger" },
    { name: "Info", hex: "#3B82F6", rgb: "59, 130, 246", usage: "Informasi" },
  ];

  const neutralColors = [
    { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255" },
    { name: "Gray 50", hex: "#F9FAFB", rgb: "249, 250, 251" },
    { name: "Gray 100", hex: "#F3F4F6", rgb: "243, 244, 246" },
    { name: "Gray 200", hex: "#E5E7EB", rgb: "229, 231, 235" },
    { name: "Gray 500", hex: "#6B7280", rgb: "107, 114, 128" },
    { name: "Gray 700", hex: "#374151", rgb: "55, 65, 81" },
    { name: "Gray 900", hex: "#111827", rgb: "17, 24, 39" },
    { name: "Black", hex: "#000000", rgb: "0, 0, 0" },
  ];

  const ColorCard = ({ color, showCss = false }: any) => (
    <Card className="border border-gray-200">
      <CardBody className="p-4">
        <div
          className="w-full h-24 rounded-lg mb-3 border border-gray-200"
          style={{ backgroundColor: color.hex }}
        />
        <h4 className="font-semibold text-gray-800 mb-2">{color.name}</h4>
        <div className="space-y-1 text-xs mb-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">HEX</span>
            <code className="bg-gray-100 px-2 py-1 rounded">{color.hex}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">RGB</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-[10px]">{color.rgb}</code>
          </div>
          {showCss && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">CSS</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-[10px]">{color.css}</code>
            </div>
          )}
        </div>
        {color.usage && (
          <p className="text-xs text-gray-500 mb-3">{color.usage}</p>
        )}
        <Button
          size="sm"
          variant="flat"
          className="w-full"
          startContent={
            copiedColor === color.name ? (
              <FiCheck className="w-3 h-3 text-green-600" />
            ) : (
              <FiCopy className="w-3 h-3" />
            )
          }
          onClick={() => copyToClipboard(color.hex, color.name)}
        >
          {copiedColor === color.name ? "Copied!" : "Copy HEX"}
        </Button>
      </CardBody>
    </Card>
  );

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Warna</h2>
        <p className="text-gray-600">
          Palet warna myUnila dirancang untuk menciptakan hierarki visual yang jelas dan konsisten.
        </p>
      </div>

      {/* Primary Colors */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Primary Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {primaryColors.map((color) => (
            <ColorCard key={color.name} color={color} showCss />
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Gradients</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {gradients.map((gradient) => (
            <Card key={gradient.name} className="border border-gray-200">
              <CardBody className="p-4">
                <div
                  className="w-full h-24 rounded-lg mb-3"
                  style={{ background: gradient.value }}
                />
                <h4 className="font-semibold text-gray-800 mb-2">{gradient.name}</h4>
                <div className="space-y-1 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">Tailwind CSS:</span>
                    <code className="block bg-gray-100 px-2 py-1 rounded mt-1 text-[10px]">
                      {gradient.css}
                    </code>
                  </div>
                  <p className="text-gray-500 mt-2">Usage: {gradient.usage}</p>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  className="w-full"
                  startContent={<FiCopy className="w-3 h-3" />}
                  onClick={() => copyToClipboard(gradient.value, gradient.name)}
                >
                  {copiedColor === gradient.name ? "Copied!" : "Copy CSS"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semanticColors.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </div>

      {/* Neutral Colors */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Neutral Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {neutralColors.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <Card className="border border-gray-200">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Contoh Penggunaan</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Button</h4>
              <Button className="bg-myunila text-white w-full">Primary Button</Button>
              <code className="block text-xs mt-2 bg-gray-100 p-2 rounded">
                bg-myunila text-white
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Card Header</h4>
              <div className="bg-myunila-50 p-4 rounded-lg border border-myunila-100">
                <p className="text-myunila font-semibold">Card Title</p>
              </div>
              <code className="block text-xs mt-2 bg-gray-100 p-2 rounded">
                bg-myunila-50 text-myunila
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Text Link</h4>
              <p className="text-myunila hover:text-myunila-700 font-semibold cursor-pointer">
                Link Text
              </p>
              <code className="block text-xs mt-2 bg-gray-100 p-2 rounded">
                text-myunila hover:text-myunila-700
              </code>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
