"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-white rounded-lg shadow-md">
              <Image
                src="https://res.cloudinary.com/dtqvb1uhi/image/upload/v1765800123/logo_xbm99t.png"
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
