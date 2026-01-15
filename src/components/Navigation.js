"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#005A9C', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="rounded-lg shadow-md">
              <Image
                src="/image/logo.png"
                alt="OCEANE GROUP Logo"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-white font-semibold text-lg">Supplier Questionnaire</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                pathname === "/"
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/supplier-questionnaire"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                pathname === "/supplier-questionnaire"
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Supplier Questionnaire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
