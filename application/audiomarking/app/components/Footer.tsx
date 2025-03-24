"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow z-10">
      <div className="w-full mx-auto p-4 flex flex-col lg:flex-row lg:items-center lg:justify-end">
       
        <ul className="flex flex-col lg:flex-row flex-wrap items-center mt-2 lg:mt-0 text-xs lg:text-sm font-medium text-gray-500 lg:ml-6">
          <span className="lg:mr-4">
            <Link href="/legal" target="_blank" className="hover:underline text-gray-500 text-sm md:text-md">
              Datenschutz
            </Link>
          </span>
          <span className="text-xs lg:text-sm text-gray-500 lg:ml-auto text-center">
          © 2025{" "}
          <Link href="/" className="hover:underline text-gray-500 text-xs">
            Mario von Bassen
          </Link>
          . Alle Rechte vorbehalten.
        </span>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
