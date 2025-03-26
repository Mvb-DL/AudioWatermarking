"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  const handleTutorialRestart = () => {
    // Entferne das Flag, damit das Tutorial wieder startet
    localStorage.removeItem("tutorialSeen");
    // Neu laden, damit der useEffect auf der Mainpage den neuen Zustand erkennt
    window.location.reload();
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow z-10">
      <div className="w-full mx-auto p-4 flex flex-row items-center justify-center lg:justify-end">
        <ul className="flex flex-row flex-wrap items-center mt-2 text-xs lg:text-sm font-medium text-gray-500">
          <div className="mb-2 md:mb-0">
          <span className="mr-4">
            <Link
              href="/legal"
              target="_blank"
              className="hover:underline text-gray-500 text-sm md:text-md cursor-pointer"
            >
              Datenschutz
            </Link>
          </span>
          <span className="mr-4">
            <button
              onClick={handleTutorialRestart}
              className="hover:underline text-gray-500 text-sm md:text-md cursor-pointer"
            >
              Tutorial
            </button>
          </span>
          </div>
          <span className="text-xs lg:text-sm text-gray-500 text-center">
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
