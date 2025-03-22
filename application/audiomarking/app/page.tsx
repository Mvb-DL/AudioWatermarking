"use client";
import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  DragEvent,
} from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";

export default function Home() {
  // Zustand für das zweite Upload-Feld
  const [showSecondUpload, setShowSecondUpload] = useState(false);
  // Zustand, ob die grüne Box (Visualisierung) angezeigt wird
  const [showGreenBox, setShowGreenBox] = useState(false);
  // Zustand für den Plot-Image-URL
  const [plotUrl, setPlotUrl] = useState<string | null>(null);

  // Zustände für Upload-Feld 1
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);

  // Zustände für Upload-Feld 2
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [dragActive2, setDragActive2] = useState(false);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const [segmentData, setSegmentData] = useState<any[] | null>(null);


  // Markdown-Zustand für die rechte Box
  const [markdownText, setMarkdownText] = useState("");

  // Markdown aus GitHub laden (Raw-Version)
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/Mvb-DL/AudioWatermarking/main/README.md"
    )
      .then((res) => res.text())
      .then((text) => setMarkdownText(text))
      .catch((err) =>
        console.error("Fehler beim Laden der Markdown-Datei:", err)
      );
  }, []);

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

  const handleSubmit = async () => {
    setShowGreenBox(true);
    setPlotUrl(null);
  
    if (!showSecondUpload && selectedFile1) {
      const formData = new FormData();
      formData.append("audio_file", selectedFile1);
  
      try {
        const res = await fetch("/api/fingerprint", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
        console.log("📦 Microservice Response:", data);
  
        if (data.image_base64) {
          const base64ImageUrl = `data:image/png;base64,${data.image_base64}`;
          setPlotUrl(base64ImageUrl);
          setSegmentData(data.segments || null); // 👈 hier!
        } else {
          console.error("❌ Kein Bild in der Antwort.");
        }
      } catch (err) {
        console.error("❌ Fehler beim API-Aufruf:", err);
      }
  
    } else if (showSecondUpload && selectedFile1 && selectedFile2) {
      const formData = new FormData();
      formData.append("audio1", selectedFile1);
      formData.append("audio2", selectedFile2);
  
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          body: formData,
        });
  
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPlotUrl(url);
      } catch (err) {
        console.error("❌ Fehler beim Compare:", err);
      }
    }
  };

  const downloadJSON = () => {
    if (!segmentData) return;
  
    const jsonStr = JSON.stringify(segmentData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "fingerprint_segments.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  
  

  return (
    <div className="min-h-screen flex flex-col p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
      {/* Hauptbereich: Linke Spalte (Upload-Felder & Visualisierung) und rechte Box (Markdown-Viewer) */}
      <div className="flex flex-col md:flex-row gap-8 flex-grow md:items-stretch">
        {/* Linke Spalte – feste Höhe */}
        <div className="w-full md:w-2/4 flex flex-col gap-8 h-[400px] lg:h-[550px] xl:h-[700px]">
          <div className="flex flex-col flex-grow">
            {/* Blaue Box */}
            <main className="w-full">
              <div className="flex flex-col-reverse md:flex-row gap-1 md:items-stretch border border-blue-500 h-[350px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
                {/* Uploadfelder */}
                <div className="w-full md:w-1/2 flex-1">
                  <div className="h-full w-full border border-dashed">
                    {showSecondUpload ? (
                      <div className="flex flex-col h-full gap-1 md:gap-2">
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
                            <div className="relative w-full">
                              <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                                {selectedFile1.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile1(null);
                                  setShowGreenBox(false);
                                }}
                                className="absolute top-0 right-0 m-1 text-red-500 hover:text-red-700"
                                aria-label="Datei entfernen"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-300 text-center md:text-md">
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
                            <div className="relative w-full">
                              <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                                {selectedFile2.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile2(null);
                                  setShowGreenBox(false);
                                }}
                                className="absolute top-0 right-0 m-1 text-red-500 hover:text-red-700"
                                aria-label="Datei entfernen"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-300 text-center md:text-md">
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
                          <div className="relative w-full">
                            <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                              {selectedFile1.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile1(null);
                                setShowGreenBox(false);
                              }}
                              className="absolute top-0 right-0 m-1 text-red-500 hover:text-red-700"
                              aria-label="Datei entfernen"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-300 text-center md:text-md">
                            Add your audio file
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Toggle-Button */}
                  {!showGreenBox && (
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
                  )}
                </div>
                {/* Statische Textbox */}
                <div className="w-full md:w-1/2 flex-1 flex flex-col justify-between p-6 border bg-gray-50 dark:bg-gray-800">
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
            {/* Grüne Box – Hier wird der Plot (als Bild) angezeigt */}
            {showGreenBox && (
              <div className="w-full p-4 border border-green-500 bg-gray-50 dark:bg-gray-800 h-[150px] md:h-[100px] lg:h-[200px] xl:h-[300px] flex items-center justify-center">
                {plotUrl ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <img
                      src={plotUrl}
                      alt="Visualisierung"
                      className="max-h-[200px] object-contain"
                    />
                    {segmentData && (
                      <button
                        onClick={downloadJSON}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        JSON herunterladen
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    Lade Visualisierung...
                  </p>
                )}

              </div>
            )}
          </div>
        </div>
        {/* Rechte Box (Markdown-Viewer) */}
        <aside className="w-full md:w-2/4 p-4 border border-red-500 bg-white dark:bg-black flex flex-col h-[400px] lg:h-[550px] xl:h-[700px]">
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => {
                  const src =
                    props.src && props.src.startsWith("http")
                      ? props.src
                      : `https://raw.githubusercontent.com/Mvb-DL/AudioWatermarking/main/${props.src}`;
                  return (
                    <img
                      {...props}
                      src={src}
                      style={{ maxWidth: "100%" }}
                      alt={props.alt}
                    />
                  );
                },
              }}
            >
              {markdownText}
            </ReactMarkdown>
          </div>
        </aside>
      </div>
    </div>
  );
}
