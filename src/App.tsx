import { useState, useEffect, useCallback } from "react";
import {
  FileCode2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { ImageUploader } from "./components/ImageUploader";
import { MathPreview } from "./components/MathPreview";
import { HwpEditor } from "./components/HwpEditor";
import { HistoryList } from "./components/HistoryList";
import { HangulGuideModal } from "./components/HangulGuideModal";
import { RecognizedEquation } from "./types";
import { convertHwpToLatex } from "./utils/hwpConverter";

const STORAGE_KEY = "hwp_math_converter_history_v1";

export default function App() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEquation, setCurrentEquation] = useState<RecognizedEquation | null>(null);
  const [previewLatex, setPreviewLatex] = useState<string>("");
  const [history, setHistory] = useState<RecognizedEquation[]>([]);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [lastRequest, setLastRequest] = useState<{
    base64: string;
    mimeType: string;
    hint?: string;
  } | null>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          // Set first item as current if empty
          setCurrentEquation(parsed[0]);
          setSelectedImageUrl(parsed[0].imageUrl || null);
          setPreviewLatex(parsed[0].latex);
        }
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((items: RecognizedEquation[]) => {
    setHistory(items);
    try {
      // Keep up to 25 items, strip heavy image data for storage efficiency if needed
      const trimmed = items.slice(0, 25);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  }, []);

  // Handle Equation Recognition via Gemini Backend
  const handleRecognize = async (base64: string, mimeType: string, hint?: string) => {
    setSelectedImageUrl(base64);
    setLastRequest({ base64, mimeType, hint });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recognize-equation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          userHint: hint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "수식 인식에 실패했습니다.");
      }

      const newEquation: RecognizedEquation = {
        id: "eq_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        title: data.title || "수식",
        hwpScript: data.hwpScript || "",
        latex: data.latex || "",
        explanation: data.explanation || "",
        symbolsUsed: data.symbolsUsed || [],
        confidence: data.confidence || "high",
        imageUrl: base64,
        createdAt: Date.now(),
      };

      setCurrentEquation(newEquation);
      setPreviewLatex(newEquation.latex);

      // Add to history
      const updatedHistory = [newEquation, ...history.filter((h) => h.id !== newEquation.id)];
      saveHistory(updatedHistory);
    } catch (err: unknown) {
      console.error("Recognition error:", err);
      const msg =
        err instanceof Error ? err.message : "수식 이미지를 인식하지 못했습니다. 다시 시도해주세요.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    if (lastRequest) {
      handleRecognize(lastRequest.base64, lastRequest.mimeType, lastRequest.hint);
    }
  };

  // User edits HWP script in editor
  const handleHwpChange = (newScript: string) => {
    if (!currentEquation) return;
    const updated = { ...currentEquation, hwpScript: newScript };
    setCurrentEquation(updated);

    // Dynamically update KaTeX preview
    const convertedLatex = convertHwpToLatex(newScript);
    setPreviewLatex(convertedLatex || currentEquation.latex);
  };

  const handleClearImage = () => {
    setSelectedImageUrl(null);
    setCurrentEquation(null);
    setPreviewLatex("");
    setError(null);
  };

  const handleSelectHistoryItem = (item: RecognizedEquation) => {
    setCurrentEquation(item);
    setSelectedImageUrl(item.imageUrl || null);
    setPreviewLatex(item.latex);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = history.filter((h) => h.id !== id);
    saveHistory(filtered);
    if (currentEquation?.id === id) {
      if (filtered.length > 0) {
        handleSelectHistoryItem(filtered[0]);
      } else {
        handleClearImage();
      }
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("모든 수식 변환 기록을 삭제하시겠습니까?")) {
      saveHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  한글 수식 변환기
                </h1>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 hidden sm:inline-block">
                  HWP Math OCR
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                수식 이미지를 인식하여 한글(HWP) 수식 편집기 스크립트로 자동 변환
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-guide"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>한글 사용법</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium">
              <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono text-[11px] font-bold text-blue-700 shadow-2xs">
                Ctrl + N, M
              </kbd>
              <span>수식창 바로가기</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Error Alert if any */}
        {error && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold">안내: </span>
                <span>{error}</span>
                <p className="text-[11px] text-red-600/80 mt-0.5">
                  AI 서버 일시 과부하인 경우 잠시 후 &apos;다시 시도&apos; 버튼을 누르면 다른 안정화 모델로 즉시 재시도됩니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {lastRequest && (
                <button
                  type="button"
                  id="btn-retry-recognition"
                  onClick={handleRetryLast}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 시도</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                title="닫기"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Upload & Preview Area */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>수식 이미지 입력</span>
                </h2>
                <span className="text-[11px] text-slate-400">사진 / 캡처 / 예제</span>
              </div>

              <ImageUploader
                onImageSelected={handleRecognize}
                isLoading={isLoading}
                selectedImageUrl={selectedImageUrl}
                onClearImage={handleClearImage}
              />
            </div>

            {/* Quick HWP Cheat Sheet */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2.5 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>한글 수식 편집기 단축키 요약</span>
              </h3>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>수식 편집기 열기</span>
                  <kbd className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Ctrl + N, M
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>수식 본문에 넣고 닫기</span>
                  <kbd className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Shift + Esc
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>입력창 - 미리보기 전환</span>
                  <kbd className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Tab
                  </kbd>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Visual Math Preview & HWP Code Editor */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            {/* Visual Formula Comparison Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>실시간 수식 미리보기</span>
                  </h2>
                  {currentEquation?.title && (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                      {currentEquation.title}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">화면과 이미지 비교</span>
              </div>

              <MathPreview
                latex={previewLatex}
                title={currentEquation?.title}
              />
            </div>

            {/* HWP Editor & Symbol Bar */}
            {currentEquation ? (
              <HwpEditor
                hwpScript={currentEquation.hwpScript}
                latex={currentEquation.latex}
                explanation={currentEquation.explanation}
                symbolsUsed={currentEquation.symbolsUsed}
                confidence={currentEquation.confidence}
                onHwpChange={handleHwpChange}
                onShowHangulGuide={() => setShowGuideModal(true)}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  수식 이미지를 입력하면 한글 수식 코드가 생성됩니다
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  이미지를 업로드하거나, 화면 캡처를 <kbd className="px-1 py-0.5 bg-slate-100 rounded border">Ctrl+V</kbd>로 붙여넣어보세요.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* History of recent scanned formulas */}
        <section className="w-full">
          <HistoryList
            history={history}
            onSelectEquation={handleSelectHistoryItem}
            onDeleteEquation={handleDeleteHistoryItem}
            onClearHistory={handleClearAllHistory}
            currentId={currentEquation?.id}
          />
        </section>
      </main>

      {/* Hangul Guide Modal */}
      <HangulGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>한글 수식 변환기 (HWP Math OCR) — 한컴오피스 한글 2018/2020/2022/2024 호환</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>사용 도움말</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Gemini 3.8 Flash Vision Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
