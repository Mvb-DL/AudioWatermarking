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
import dynamic from "next/dynamic";

const Plotly3D = dynamic(() => import("@/app/components/Plotly3D"), {
  ssr: false,
});

export default function Home() {
  // Neue States für Alert-Meldungen
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"error" | "success" | null>(null);

  // Automatisches Entfernen der Alert-Meldung nach 3 Sekunden
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const [showSecondUpload, setShowSecondUpload] = useState(false);
  const [showGreenBox, setShowGreenBox] = useState(false);
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [dragActive2, setDragActive2] = useState(false);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const [segmentData, setSegmentData] = useState<any[] | null>(null);
  const [markdownText, setMarkdownText] = useState("");

  // Hilfsfunktion zur Validierung von Audiodateien
  const validateAudioFile = (file: File): boolean => {
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
    ];
    const allowedExtensions = [".mp3", ".wav", ".ogg", ".flac"];
    if (!allowedMimeTypes.includes(file.type)) return false;
    const fileName = file.name.toLowerCase();
    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) return false;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) return false;
    return true;
  };

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
      if (validateAudioFile(file)) {
        setSelectedFile1(file);
      } else {
        setAlertMessage("Bitte nur gültige Audiodateien (mp3, wav, ogg, flac) hochladen und maximale Dateigröße von 10MB beachten.");
        setAlertType("error");
      }
    }
  };

  const handleChange1 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateAudioFile(file)) {
        setSelectedFile1(file);
      } else {
        setAlertMessage("Bitte nur gültige Audiodateien (mp3, wav, ogg, flac) hochladen und maximale Dateigröße von 10MB beachten.");
        setAlertType("error");
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
      if (validateAudioFile(file)) {
        setSelectedFile2(file);
      } else {
        setAlertMessage("Bitte nur gültige Audiodateien (mp3, wav, ogg, flac) hochladen und maximale Dateigröße von 10MB beachten.");
        setAlertType("error");
      }
    }
  };

  const handleChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateAudioFile(file)) {
        setSelectedFile2(file);
      } else {
        setAlertMessage("Bitte nur gültige Audiodateien (mp3, wav, ogg, flac) hochladen und maximale Dateigröße von 10MB beachten.");
        setAlertType("error");
      }
    }
  };

  const handleClick2 = () => {
    inputRef2.current?.click();
  };

  const handleSubmit = async () => {
    setShowGreenBox(true);
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
        setSegmentData(data.segments || null);
        setAlertMessage("Upload erfolgreich!");
        setAlertType("success");
      } catch (err) {
        console.error("❌ Fehler beim API-Aufruf:", err);
        setAlertMessage("Fehler beim API-Aufruf!");
        setAlertType("error");
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
        const data = await res.json();
        setSegmentData(data.segments_audio1 || null);
        setAlertMessage("Vergleich erfolgreich!");
        setAlertType("success");
      } catch (err) {
        console.error("❌ Fehler beim Compare:", err);
        setAlertMessage("Fehler beim Vergleich!");
        setAlertType("error");
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

  const resetState = () => {
    setSelectedFile1(null);
    setSelectedFile2(null);
    setShowGreenBox(false);
    setSegmentData(null);
    setDragActive1(false);
    setDragActive2(false);
    setShowSecondUpload(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)] ">
      {/* Popup für Alert-Meldungen */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded shadow-lg ${
              alertType === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {alertMessage}
            <button
              onClick={() => {
                setAlertMessage(null);
                setAlertType(null);
              }}
              className="ml-2 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
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
        <div className="w-full md:w-2/4 flex flex-col gap-4 min-h-[400px] lg:h-[550px] xl:h-[800px]">
          <div className="flex flex-col flex-grow">
            {/* Blaue Box */}
            <main className="w-full">
              <div className="flex flex-col-reverse md:flex-row gap-1 md:items-stretch h-[450px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
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
            <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center break-words">
              {selectedFile1.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetState();
              }}
              className="absolute top-0 right-2 m-1 text-xl text-red-500 hover:text-red-700 cursor-pointer"
              aria-label="Datei entfernen"
            >
              X
            </button>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-300 text-center text-sm">
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
            <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center break-words">
              {selectedFile2.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetState();
              }}
              className="absolute top-0 right-2 m-1 text-xl text-red-500 hover:text-red-700 cursor-pointer"
              aria-label="Datei entfernen"
            >
              X
            </button>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-300 text-center text-sm">
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
          <span className="text-gray-900 dark:text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis block text-center break-words">
            {selectedFile1.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetState();
            }}
            className="absolute top-0 right-2 m-1 text-xl text-red-500 hover:text-red-700 cursor-pointer"
            aria-label="Datei entfernen"
          >
            X
          </button>
        </div>
      ) : (
        <span className="text-gray-500 dark:text-gray-300 text-center text-sm ">
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
                {/* Tutorial-Textbox – rechts */}
                <div className="w-full md:w-1/2 flex-1 flex flex-col justify-between pt-6 pr-6 pl-6 pb-4 md:pb-6 border bg-gray-50 dark:bg-gray-800">
                  <div className="w-full">
                    <h2 className="text-xl font-bold mb-4">Tutorial</h2>
                    <ol className="list-inside list-decimal text-sm text-left font-[family-name:var(--font-geist-mono)]">
                      <li className="mb-2 tracking-[-.01em]">
                        Lade dein Audiofile (mp3, wav, etc.) links hoch.
                      </li>
                      <li className="mb-2 tracking-[-.01em]">
                        Wähle aus, ob du dein Audiofile fingerprinten möchtest oder zwei Audiofiles auf ihre Ähnlichkeit prüfen möchtest.
                      </li>
                      <li className="mb-2 tracking-[-.01em]">
                        Klicke auf den Button.
                      </li>
                      <li className="tracking-[-.01em]">
                        Lade das File herunter, das ist jetzt dein Fingerprint!
                      </li>
                    </ol>
                  </div>
                  {(!showSecondUpload && selectedFile1) && (
                    <button
                      onClick={handleSubmit}
                      className="w-1/2 md:w-1/3 mt-4 lg:mt-0 border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 whitespace-nowrap hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4 rounded-none"
                    >
                     
                      <span className="cursor-pointer">Erstelle Fingerprint</span>
                    </button>
                  )}
                  {(showSecondUpload && selectedFile1 && selectedFile2) && (
                    <button
                      onClick={handleSubmit}
                      className="w-2/3 md:w-1/3 mt-4 lg:mt-0 border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 whitespace-nowrap hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 md:px-4 rounded-none"
                    >
                    
                      <span className="cursor-pointer">Audiofiles vergleichen</span>
                    </button>
                  )}
                </div>
              </div>
            </main>
            {showGreenBox && (
              <div className="w-full mt-10 md:mt-2 bg-gray-50 dark:bg-gray-800 min-h-[200px] lg:h-[400px] xl:h-[400px] flex flex-col md:flex-row gap-2">
                {segmentData ? (
                  <>
                    {/* Linke Box: Text + Download */}
                    <div className="w-full md:w-1/3 flex flex-col justify-between p-4 md:p-8 bg-white dark:bg-gray-900 rounded shadow">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        Hier rechts siehst du dein Audiofile, wie es in einem 3D Raum aussieht. Jedes individuelle Musikstück wird auch anders in diesem Raum dargestellt.
                      </p>
                      <div className="mt-4 lg:mt-2">
                        <button
                          onClick={downloadJSON}
                          className="px-4 py-3 bg-black text-white rounded-none hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm cursor-pointer"
                        >
                          Fingerprint herunterladen
                        </button>
                      </div>
                    </div>
                    {/* Rechte Box: Plotly 3D */}
                    <div className="w-full md:w-2/3 h-full">
                      <Plotly3D segments={segmentData} />
                    </div>
                  </>
                ) : (
                  <p className="text-start text-gray-700 dark:text-gray-300 w-full p-2">
                    Erstellung Fingerprint
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <aside
  className={`w-full md:w-2/4 ${showGreenBox ? "mt-32" : "mt-16"} lg:mt-0 p-4 bg-white dark:bg-black flex flex-col h-[500px] lg:h-[550px] xl:h-[800px]`}
>
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
