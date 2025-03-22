"use client";
import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";

export default function Home() {
  // Zustand für das zweite Upload-Feld
  const [showSecondUpload, setShowSecondUpload] = useState(false);

  // Zustände für Upload-Feld 1
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);

  // Zustände für Upload-Feld 2
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [dragActive2, setDragActive2] = useState(false);
  const inputRef2 = useRef<HTMLInputElement>(null);

  // Handler für Upload-Feld 1
  const handleDragOver1 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive1(true);
  };

  const handleDragLeave1 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive1(false);
  };

  const handleDrop1 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive1(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile1(file);
      } else {
        alert("Bitte nur Audiodateien hochladen.");
      }
    }
  };

  const handleChange1 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile1(file);
      } else {
        alert("Bitte nur Audiodateien hochladen.");
      }
    }
  };

  const handleClick1 = () => {
    inputRef1.current?.click();
  };

  // Handler für Upload-Feld 2
  const handleDragOver2 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive2(true);
  };

  const handleDragLeave2 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive2(false);
  };

  const handleDrop2 = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive2(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile2(file);
      } else {
        alert("Bitte nur Audiodateien hochladen.");
      }
    }
  };

  const handleChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile2(file);
      } else {
        alert("Bitte nur Audiodateien hochladen.");
      }
    }
  };

  const handleClick2 = () => {
    inputRef2.current?.click();
  };

  // API-Aufruf-Funktion
  const handleSubmit = async () => {
    if (!showSecondUpload && selectedFile1) {
      const formData = new FormData();
      formData.append("audio", selectedFile1);
      try {
        const res = await fetch("/fingerprinting", {
          method: "POST",
          body: formData,
        });
        console.log(await res.json());
      } catch (err) {
        console.error(err);
      }
    } else if (showSecondUpload && selectedFile1 && selectedFile2) {
      const formData = new FormData();
      formData.append("audio1", selectedFile1);
      formData.append("audio2", selectedFile2);
      try {
        const res = await fetch("/compare", {
          method: "POST",
          body: formData,
        });
        console.log(await res.json());
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Definierte Höhe für beide Boxen – passt sich je nach Breakpoint an
  const containerHeightClass =
    "h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px]";

  return (
    <div className="min-h-screen flex flex-col p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Hauptbereich: Bei md+ nebeneinander – items werden gestreckt */}
      <div className="flex flex-col md:flex-row gap-8 md:items-stretch">
        {/* Main-Element: nimmt 50 % der Breite auf md+ ein */}
        <main className="w-full md:w-2/4 flex flex-col gap-8 border border-blue-500">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          {/* Inhalt: Auf sm untereinander, ab md nebeneinander */}
          <div className="flex flex-col-reverse md:flex-row gap-1 md:items-stretch">
            {/* Linke Spalte: Uploadfelder – volle Breite auf sm, ab md 50 % */}
            <div className="w-full md:w-1/2">
              <div className={`${containerHeightClass} w-full border border-dashed`}>
                {showSecondUpload ? (
                  <div className="flex flex-col h-full gap-2">
                    {/* Erstes Upload-Feld */}
                    <div
                      onDragOver={handleDragOver1}
                      onDragLeave={handleDragLeave1}
                      onDrop={handleDrop1}
                      onClick={handleClick1}
                      className={`flex-1 flex items-center justify-center border border-dashed cursor-pointer ${
                        dragActive1
                          ? "bg-gray-200 dark:bg-gray-600"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <input
                        ref={inputRef1}
                        id="audio-upload-1"
                        type="file"
                        accept="audio/*"
                        onChange={handleChange1}
                        className="hidden"
                      />
                      {selectedFile1 ? (
                        <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis text-center">
                          {selectedFile1.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-300 text-center md:text-lg">
                          Add your <b className="font-semibold">first</b> audio file
                        </span>
                      )}
                    </div>
                    {/* Zweites Upload-Feld */}
                    <div
                      onDragOver={handleDragOver2}
                      onDragLeave={handleDragLeave2}
                      onDrop={handleDrop2}
                      onClick={handleClick2}
                      className={`flex-1 flex items-center justify-center border border-dashed cursor-pointer ${
                        dragActive2
                          ? "bg-gray-200 dark:bg-gray-600"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <input
                        ref={inputRef2}
                        id="audio-upload-2"
                        type="file"
                        accept="audio/*"
                        onChange={handleChange2}
                        className="hidden"
                      />
                      {selectedFile2 ? (
                        <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis text-center">
                          {selectedFile2.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-300 text-center md:text-lg">
                          Add your <b className="font-semibold">second</b> audio file
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver1}
                    onDragLeave={handleDragLeave1}
                    onDrop={handleDrop1}
                    onClick={handleClick1}
                    className={`h-full flex items-center justify-center border border-dashed cursor-pointer ${
                      dragActive1
                        ? "bg-gray-200 dark:bg-gray-600"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      ref={inputRef1}
                      id="audio-upload-1"
                      type="file"
                      accept="audio/*"
                      onChange={handleChange1}
                      className="hidden"
                    />
                    {selectedFile1 ? (
                      <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis text-center">
                        {selectedFile1.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-300 text-center">
                        Add your audio file
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Toggle-Button */}
              <div className="mt-1 flex justify-start">
                {showSecondUpload ? (
                  <button
                    onClick={() => setShowSecondUpload(false)}
                    className="p-2 border border-gray-300 rounded-none text-sm md:text-md bg-white font-[family-name:var(--font-geist-mono)] cursor-pointer"
                    aria-label="Zweites Upload-Feld entfernen"
                  >
                    Fingerprint Audiofile
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSecondUpload(true)}
                    className="p-2 border border-gray-300 rounded-none text-sm md:text-md bg-white font-[family-name:var(--font-geist-mono)] cursor-pointer"
                    aria-label="Weiteres Upload-Feld hinzufügen"
                  >
                    Compare Audiofiles
                  </button>
                )}
              </div>
            </div>
            {/* Rechte Spalte: Textbox – volle Breite auf sm, ab md 50 %, mit gleicher Höhe */}
            <div className={`w-full md:w-1/2 ${containerHeightClass} flex flex-col justify-between p-6 border bg-gray-50 dark:bg-gray-800`}>
              <div className="w-full">
                <ol className="list-inside list-decimal text-sm text-left font-[family-name:var(--font-geist-mono)]">
                  <li className="mb-2 tracking-[-.01em]">
                    Get started by editing{" "}
                    <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded-none font-semibold">
                      app/page.tsx
                    </code>
                    .
                  </li>
                  <li className="tracking-[-.01em]">
                    Save and see your changes instantly.
                  </li>
                </ol>
              </div>
              {(!showSecondUpload && selectedFile1) && (
                <button
                  onClick={handleSubmit}
                  className="w-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2 whitespace-nowrap hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4 rounded-none"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
                    <span className="flex-1 text-center">Fingerprint</span>
                  </div>
                </button>
              )}
              {(showSecondUpload && selectedFile1 && selectedFile2) && (
                <button
                  onClick={handleSubmit}
                  className="w-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2 whitespace-nowrap hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4 rounded-none"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
                    <span className="flex-1 text-center">Compare</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Aside-Element: nimmt auf md+ ebenfalls 50 % der Breite ein */}
        <aside className="w-full md:w-2/4 flex items-center justify-center p-4 border bg-gray-100 dark:bg-gray-900 border-red-500">
          <p>This is the additional box on the right.</p>
        </aside>
      </div>

      {/* Footer: fixiert unten rechts */}
      <footer className="fixed bottom-0 right-0 m-4 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          How it works
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Mario von Bassen
        </a>
      </footer>
    </div>
  );
}
