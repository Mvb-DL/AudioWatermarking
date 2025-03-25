"use client";
import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  DragEvent,
  useCallback,
} from "react";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";
import dynamic from "next/dynamic";
import CookieBanner from '@/app/components/CookieBanner';
import Footer from "@/app/components/Footer";

// Placeholder-Komponente für reservierten Platz mit Tailwind-Animation
function Placeholder({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`}></div>;
}

// Dynamischer Import für 3D-Komponenten
const Plotly3D = dynamic(() => import("@/app/components/Plotly3D"), {
  ssr: false,
});
const ComparePlotly3D = dynamic(() => import("@/app/components/Compare"), {
  ssr: false,
});

// Typdefinitionen für die Props der Wrapper-Komponenten
interface Plotly3DWrapperProps {
  segments: any;
  onLoaded: () => void;
}

interface ComparePlotly3DWrapperProps {
  segments1: any;
  segments2: any;
  onLoaded: () => void;
}

// Wrapper für Plotly3D: Rendert nur, wenn segments ein Array ist
function Plotly3DWrapper({ segments, onLoaded }: Plotly3DWrapperProps) {
  useEffect(() => {
    if (Array.isArray(segments)) {
      onLoaded();
    }
  }, [segments, onLoaded]);

  if (!segments || !Array.isArray(segments)) {
    return null;
  }
  return <Plotly3D segments={segments} />;
}

// Angepasster Wrapper für ComparePlotly3D:
// Rendert die 3D-Komponente nur, wenn beide Segmente als Array vorliegen.
function ComparePlotly3DWrapper({
  segments1,
  segments2,
  onLoaded,
}: ComparePlotly3DWrapperProps) {
  useEffect(() => {
    if (Array.isArray(segments1) && Array.isArray(segments2)) {
      onLoaded();
    }
  }, [segments1, segments2, onLoaded]);

  if (
    !segments1 ||
    !Array.isArray(segments1) ||
    !segments2 ||
    !Array.isArray(segments2)
  ) {
    return null;
  }
  return <ComparePlotly3D segments1={segments1} segments2={segments2} />;
}

// Dynamische Progress-Komponente
function LoadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return <Progress className="w-3/4" value={progress} />;
}

export default function Home() {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"error" | "success" | null>(null);
  const [showSecondUpload, setShowSecondUpload] = useState(false);
  const [showGreenBox, setShowGreenBox] = useState(false);
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [dragActive2, setDragActive2] = useState(false);
  const inputRef2 = useRef<HTMLInputElement>(null);
  // Für fingerprint erwarten wir ein Array, für compare ein Objekt mit den Keys "audio1" und "audio2"
  const [segmentData, setSegmentData] = useState<any>(null);
  const [markdownText, setMarkdownText] = useState("");
  // State, um den Ladevorgang der 3D-Komponente zu tracken
  const [is3DLoaded, setIs3DLoaded] = useState(false);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

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
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return false;
    return true;
  };

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
        setAlertMessage(
          "Bitte nur gültige Audiodateien hochladen und maximale Dateigröße von 10MB beachten."
        );
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
        setAlertMessage(
          "Bitte nur gültige Audiodateien hochladen und maximale Dateigröße von 10MB beachten."
        );
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
        setAlertMessage(
          "Bitte nur gültige Audiodateien hochladen und maximale Dateigröße von 10MB beachten."
        );
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
        setAlertMessage(
          "Bitte nur gültige Audiodateien hochladen und maximale Dateigröße von 10MB beachten."
        );
        setAlertType("error");
      }
    }
  };
  const handleClick2 = () => {
    inputRef2.current?.click();
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

  const handleSubmit = async () => {
    
    setIs3DLoaded(false);
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
        console.log("📦 Microservice Response (fingerprint):", data);
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
        console.log("📦 Microservice Response (compare):", data);
        setSegmentData(data);
        setAlertMessage("Vergleich erfolgreich!");
        setAlertType("success");
      } catch (err) {
        console.error("❌ Fehler beim Compare:", err);
        setAlertMessage("Fehler beim Vergleich!");
        setAlertType("error");
      }
    }
  };

  // Callback, um den Ladevorgang der 3D-Komponente zu signalisieren
  const handle3DLoaded = useCallback(() => {
    setIs3DLoaded(true);
  }, []);

  return (
    <div>
      <div className="min-h-screen flex flex-col p-4 pb-20 gap-16 sm:p-10">
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

        <div className="flex justify-center md:justify-start ">
          <h1 className="text-3xl font-bold">Audio Fingerprint</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8 flex-grow md:items-stretch">
          <div className="w-full md:w-2/4 flex flex-col gap-4 min-h-[400px] lg:h-[550px] xl:h-[930px] lg:pt-10">
            <div className="flex flex-col flex-grow ">
              <main className="w-full">
                <div className="flex flex-col-reverse md:flex-row gap-1 md:items-stretch h-[450px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
                  <div className="w-full md:w-1/2 flex-1">
                    <div className="h-full w-full border border-dashed">
                      {showSecondUpload ? (
                        <div className="flex flex-col h-full gap-1 md:gap-2">
                          <div
                            onDragOver={handleDragOver1}
                            onDragLeave={handleDragLeave1}
                            onDrop={handleDrop1}
                            onClick={handleClick1}
                            className={`flex-1 flex items-center justify-center border border-dashed cursor-pointer ${
                              dragActive1
                                ? "bg-gray-200"
                                : "bg-gray-50 hover:bg-gray-100"
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
                                <span className="text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                                  {selectedFile1.name}
                                </span>

                                {!showGreenBox && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (inputRef1.current)
                                      inputRef1.current.value = "";
                                    setSelectedFile1(null);
                                    setShowGreenBox(false);
                                  }}
                                  className="absolute top-0 right-2 m-1 text-xl text-red-500"
                                  aria-label="Datei entfernen"
                                >
                                  X
                                </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-center text-sm">
                                Add your <b>first</b> audio file
                              </span>
                            )}
                          </div>
                          <div
                            onDragOver={handleDragOver2}
                            onDragLeave={handleDragLeave2}
                            onDrop={handleDrop2}
                            onClick={handleClick2}
                            className={`flex-1 flex items-center justify-center border border-dashed cursor-pointer ${
                              dragActive2
                                ? "bg-gray-200"
                                : "bg-gray-50 hover:bg-gray-100"
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
                                <span className="text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                                  {selectedFile2.name}
                                </span>
                                {!showGreenBox && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (inputRef2.current)
                                      inputRef2.current.value = "";
                                    setSelectedFile2(null);
                                    setShowGreenBox(false);
                                  }}
                                  className="absolute top-0 right-2 m-1 text-xl text-red-500"
                                  aria-label="Datei entfernen"
                                >
                                  X
                                </button> )}
                              </div> 
                            ) : (
                              <span className="text-gray-500 text-center text-sm">
                                Add your <b>second</b> audio file
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
                              ? "bg-gray-200"
                              : "bg-gray-50 hover:bg-gray-100"
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
                              <span className="text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis block text-center">
                                {selectedFile1.name}
                              </span>
                              {!showGreenBox && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inputRef1.current)
                                    inputRef1.current.value = "";
                                  setSelectedFile1(null);
                                  setShowGreenBox(false);
                                }}
                                className="absolute top-0 right-2 m-1 text-xl text-red-500"
                                aria-label="Datei entfernen"
                              >
                                X
                              </button> )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-center text-sm">
                              Add your audio file
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!showGreenBox && (
                      <div className="mt-1 flex justify-start">
                        {showSecondUpload ? (
                          <button
                            onClick={() => setShowSecondUpload(false)}
                            className="p-2 border border-gray-300 text-sm bg-white cursor-pointer"
                          >
                            Fingerprint Audiofile
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowSecondUpload(true)}
                            className="p-2 border border-gray-300 text-sm bg-white cursor-pointer"
                          >
                            Compare Audiofiles
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-1/2 flex-1 flex flex-col justify-between p-4 border bg-gray-50">
                    <div className="w-full">
                      <h2 className="text-xl font-bold mb-4">Tutorial</h2>
                      <ol className="list-inside list-decimal text-sm">
                        <li className="mb-2">Lade dein Audiofile (mp3, wav, etc.) hoch.</li>
                        <li className="mb-2">Wähle aus, ob du fingerprinten oder vergleichen möchtest.</li>
                        <li className="mb-2">Klicke auf den Button.</li>
                        <li>Downloade das Ergebnis.</li>
                      </ol>
                    </div>
                    {(!showGreenBox && !showSecondUpload && selectedFile1) && (
                      <button
                        onClick={handleSubmit}
                        className="w-1/3 px-4 py-3 bg-black text-white rounded-none hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm cursor-pointer"
                      >
                        Erstelle Fingerprint
                      </button>
                    )}
                    {(!showGreenBox &&
                      showSecondUpload &&
                      selectedFile1 &&
                      selectedFile2) && (
                      <button
                        onClick={handleSubmit}
                        className="w-1/3 px-4 py-3 bg-black text-white rounded-none hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm cursor-pointer"
                      >
                        Audiofiles vergleichen
                      </button>
                    )}
                     {showGreenBox && (
                       
                           <button
                           onClick={(e) => {
                            e.stopPropagation();
                            if (inputRef1.current)
                            inputRef1.current.value = "";
                            if (inputRef2.current)
                            inputRef2.current.value = "";
                            setSelectedFile1(null);
                            setSelectedFile2(null);
                            setShowGreenBox(false);
                          }}
                             className="w-1/3 px-4 py-3 bg-black text-white rounded-none hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm cursor-pointer"
                           >
                             Neues Audiofile
                           </button>
                    
                       )}
                  </div>
                </div>
              </main>
              {showGreenBox && (
                <div
                  className={`relative w-full mt-5 bg-gray-50 border min-h-[200px] lg:h-[450px] flex flex-col md:flex-row gap-2  ${
                    segmentData &&
                    segmentData.weighted_avg_deviation !== undefined &&
                    segmentData.weighted_std_deviation !== undefined &&
                    segmentData.weighted_avg_deviation.toFixed(2) ===
                      segmentData.weighted_std_deviation.toFixed(2)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {segmentData ? (
                    showSecondUpload ? (
                      // Compare-Zweig
                      <div className="w-full h-full">
                        <ComparePlotly3DWrapper
                          segments1={segmentData.audio1}
                          segments2={segmentData.audio2}
                          onLoaded={handle3DLoaded}
                        />
                        <div className="mt-2 p-2 border rounded-none flex">
                          <div className="w-1/2">
                            <p>
                              <strong>Weighted Avg Deviation:</strong>{" "}
                              {segmentData?.weighted_avg_deviation !== undefined
                                ? segmentData.weighted_avg_deviation.toFixed(2)
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Weighted Std Deviation:</strong>{" "}
                              {segmentData?.weighted_std_deviation !== undefined
                                ? segmentData.weighted_std_deviation.toFixed(2)
                                : "N/A"}
                            </p>
                          </div>
                          <div className="w-1/2 flex items-center justify-end">
                            <p>
                              Die Audiofiles weichen{" "}
                              {segmentData?.weighted_avg_deviation !== undefined ? (
                                <b>
                                  {segmentData.weighted_avg_deviation.toFixed(2)}%
                                </b>
                              ) : (
                                "N/A"
                              )}{" "}
                              voneinander ab.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fingerprint-Zweig
                      <>
                        <div className="w-full md:w-1/3 flex flex-col justify-between p-4 md:p-8 bg-white dark:bg-gray-900 rounded-none shadow">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            Hier rechts siehst du dein Audiofile, wie es in einem 3D Raum
                            aussieht.
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
                        <div className="w-full md:w-2/3 h-full">
                          <Plotly3DWrapper
                            segments={segmentData}
                            onLoaded={handle3DLoaded}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <Placeholder className="w-full h-full" />
                  )}
                  {(!segmentData || !is3DLoaded) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                      <LoadingProgress />
                    </div>
                  )}
                </div>
              )}
          
            </div>
          </div>
          <aside className="w-full md:w-2/4 p-4 bg-white dark:bg-black flex flex-col h-[500px] lg:h-[550px] xl:h-[930px] lg:pt-10">
            <div className="flex-1 overflow-y-auto markdown-body">
              {markdownText ? (
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
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              )}
            </div>
          </aside>
          <CookieBanner />
        </div>
      </div>
      <>
        <Footer />
      </>
    </div>
  );
}
