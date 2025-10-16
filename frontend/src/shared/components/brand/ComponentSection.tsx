"use client";

import { Card, CardBody, Button, Input, Chip } from "@heroui/react";
import { FiSearch, FiUser, FiMail } from "react-icons/fi";

export default function ComponentSection() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Components</h2>
        <p className="text-gray-600">
          Komponen UI yang sudah pre-styled dengan brand guidelines myUnila.
        </p>
      </div>

      {/* Buttons */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Buttons</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Primary Buttons</h4>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-myunila text-white">Primary</Button>
                <Button className="btn-gradient-primary">Gradient Primary</Button>
                <Button className="bg-gradient-blue-modern text-white">Gradient Modern</Button>
              </div>
              <code className="block text-xs mt-2 bg-gray-100 p-2 rounded">
                className="bg-myunila text-white" <br/>
                className="btn-gradient-primary" <br/>
                className="bg-gradient-blue-modern text-white"
              </code>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Secondary Buttons</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="bordered" className="border-myunila text-myunila">
                  Bordered
                </Button>
                <Button variant="flat" className="bg-myunila-50 text-myunila">
                  Flat
                </Button>
                <Button variant="light" className="text-myunila">
                  Light
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" className="bg-myunila text-white">Small</Button>
                <Button size="md" className="bg-myunila text-white">Medium</Button>
                <Button size="lg" className="bg-myunila text-white">Large</Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Cards */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Cards</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border border-gray-200">
              <CardBody className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Default Card</h4>
                <p className="text-sm text-gray-600">
                  Card dengan border dan shadow default
                </p>
              </CardBody>
            </Card>

            <Card className="bg-myunila-50 border border-myunila-100">
              <CardBody className="p-4">
                <h4 className="font-semibold text-myunila mb-2">Colored Card</h4>
                <p className="text-sm text-gray-600">
                  Card dengan background warna brand
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-myunila to-blue-700 text-white">
              <CardBody className="p-4">
                <h4 className="font-semibold mb-2">Gradient Card</h4>
                <p className="text-sm text-white/90">
                  Card dengan gradient background
                </p>
              </CardBody>
            </Card>
          </div>

          <code className="block text-xs mt-4 bg-gray-100 p-3 rounded">
            {`<Card className="border border-gray-200">...</Card>`}<br/>
            {`<Card className="bg-myunila-50 border border-myunila-100">...</Card>`}<br/>
            {`<Card className="bg-gradient-to-br from-myunila to-blue-700">...</Card>`}
          </code>
        </CardBody>
      </Card>

      {/* Inputs */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Input Fields</h3>
          <p className="text-sm text-gray-600 mb-6">
            Input fields dengan style sesuai halaman login myUnila.
          </p>

          <div className="space-y-6 max-w-md">
            {/* Username Input - Login Style */}
            <div>
              <label htmlFor="example-username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <Input
                id="example-username"
                type="text"
                placeholder="Masukkan username Anda"
                size="lg"
                radius="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "bg-gray-50 border border-gray-200 hover:border-myunila focus-within:border-myunila transition-all duration-300 shadow-sm hover:shadow-md !outline-none",
                  base: "!outline-none",
                }}
                startContent={<FiUser className="text-gray-400 mr-2" />}
              />
            </div>

            {/* Email Input - Login Style */}
            <div>
              <label htmlFor="example-email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="example-email"
                type="email"
                placeholder="Masukkan email Anda"
                size="lg"
                radius="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "bg-gray-50 border border-gray-200 hover:border-myunila focus-within:border-myunila transition-all duration-300 shadow-sm hover:shadow-md !outline-none",
                  base: "!outline-none",
                }}
                startContent={<FiMail className="text-gray-400 mr-2" />}
              />
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="example-search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <Input
                id="example-search"
                placeholder="Cari sesuatu..."
                size="lg"
                radius="lg"
                startContent={<FiSearch className="text-gray-400 mr-2" />}
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "bg-gray-50 border border-gray-200 hover:border-myunila focus-within:border-myunila transition-all duration-300 shadow-sm hover:shadow-md !outline-none",
                  base: "!outline-none",
                }}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">CSS Classes:</h4>
            <code className="block text-xs text-gray-600 whitespace-pre-wrap">
{`classNames={{
  input: "text-gray-800",
  inputWrapper: "bg-gray-50 border border-gray-200
    hover:border-myunila focus-within:border-myunila
    transition-all duration-300 shadow-sm hover:shadow-md
    !outline-none",
  base: "!outline-none"
}}`}
            </code>
          </div>
        </CardBody>
      </Card>

      {/* Chips/Badges */}
      <Card className="border border-gray-200 mb-6">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Chips & Badges</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Colored Chips</h4>
              <div className="flex flex-wrap gap-2">
                <Chip className="bg-myunila text-white">Primary</Chip>
                <Chip className="bg-myunila-100 text-myunila">Light</Chip>
                <Chip className="bg-green-100 text-green-700">Success</Chip>
                <Chip className="bg-orange-100 text-orange-700">Warning</Chip>
                <Chip className="bg-red-100 text-red-700">Error</Chip>
                <Chip className="bg-blue-100 text-blue-700">Info</Chip>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Chip Sizes</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" className="bg-myunila text-white">Small</Chip>
                <Chip size="md" className="bg-myunila text-white">Medium</Chip>
                <Chip size="lg" className="bg-myunila text-white">Large</Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Shadows & Borders */}
      <Card className="border border-gray-200">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Shadows & Borders</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-1">Border</h4>
              <p className="text-sm text-gray-600 mb-2">border border-gray-200</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-1">Shadow MD</h4>
              <p className="text-sm text-gray-600 mb-2">shadow-md</p>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-1">Shadow LG</h4>
              <p className="text-sm text-gray-600 mb-2">shadow-lg</p>
            </div>
          </div>

          <code className="block text-xs mt-4 bg-gray-100 p-3 rounded">
            border: border border-gray-200<br/>
            shadow: shadow-md | shadow-lg | shadow-xl<br/>
            rounded: rounded-lg | rounded-xl | rounded-2xl
          </code>
        </CardBody>
      </Card>
    </section>
  );
}
