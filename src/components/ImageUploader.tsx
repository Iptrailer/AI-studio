import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Clipboard,
  X,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { SAMPLE_EQUATIONS } from "../data/samples";
import { SampleEquation } from "../types";

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, hint?: string) => void;
  isLoading: boolean;
  selectedImageUrl: string | null;
  onClearImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  selectedImageUrl,
  onClearImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [userHint, setUserHint] = useState("");
  const [showHintInput, setShowHintInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Process File to Base64
  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일(PNG, JPG, WEBP 등)만 업로드할 수 있습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onImageSelected(result, file.type, userHint);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected, userHint]
  );

  // Global Clipboard paste handler (Ctrl+V anywhere on window)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            processFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isLoading, processFile]);

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Camera handling
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("카메라에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.");
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  }, [cameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        stopCamera();
        onImageSelected(dataUrl, "image/png", userHint);
      }
    }
  };

  // Render Sample Equation to Canvas image for immediate test
  const handleSelectSample = (sample: SampleEquation) => {
    // Generate a clean text-based / SVG data url representing the formula for Gemini to recognize
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 20px 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Render representative text of the formula
      let displaySampleText = sample.latex;
      if (sample.id === "quadratic") displaySampleText = "x = (-b ± √(b² - 4ac)) / (2a)";
      if (sample.id === "normal-dist") displaySampleText = "f(x) = (1 / (σ√(2π))) * e^(-(x-μ)² / (2σ²))";
      if (sample.id === "definite-integral") displaySampleText = "∫_{-∞}^{∞} e^(-x²) dx = √π";
      if (sample.id === "matrix-inversion") displaySampleText = "A⁻¹ = 1/(ad - bc) [ d  -b ; -c  a ]";
      if (sample.id === "euler-identity") displaySampleText = "e^(iπ) + 1 = 0";

      ctx.fillText(displaySampleText, canvas.width / 2, canvas.height / 2);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(`[예제 수식: ${sample.title}]`, canvas.width / 2, canvas.height / 2 + 50);

      const dataUrl = canvas.toDataURL("image/png");
      onImageSelected(dataUrl, "image/png", sample.title);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="math-image-input"
      />

      {/* Main Upload / Preview Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 scale-[1.005]"
            : selectedImageUrl
            ? "border-slate-300 bg-slate-900/5"
            : "border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/60"
        }`}
      >
        {selectedImageUrl ? (
          // Active Image Preview
          <div className="relative p-4 flex flex-col items-center justify-center min-h-[260px] bg-slate-50/80">
            <div className="relative group max-h-[300px] w-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <img
                src={selectedImageUrl}
                alt="수식 이미지"
                className="max-h-[260px] max-w-full object-contain rounded-lg select-none"
              />

              {/* Overlay Action Buttons */}
              {!isLoading && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="다른 이미지로 변경"
                    className="p-1.5 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-xs border border-slate-200 hover:text-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClearImage}
                    title="이미지 삭제"
                    className="p-1.5 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-xs border border-slate-200 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Scanning Status Badge */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin" />
                  <Sparkles className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    수식 이미지 분석 및 한글 스크립트 변환 중...
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    분수, 첨자, 그리스 문자 및 행렬을 정밀 판독하고 있습니다
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty State: Drag & Drop Area
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-14 h-14 mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100/80">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 mb-1">
              수식 이미지를 끌어다 놓거나 클릭하여 업로드
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              화면 캡처(<kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-700">Win+Shift+S</kbd> 후 <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-700">Ctrl+V</kbd>), 손글씨 사진, 문제집 수식 사진 모두 지원합니다.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                id="btn-upload-file"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>이미지 파일 선택</span>
              </button>

              <button
                type="button"
                id="btn-camera-capture"
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>카메라 촬영</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                <span>클립보드 붙여넣기(Ctrl+V) 지원</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional User Hint */}
      {!selectedImageUrl && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHintInput(!showHintInput)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>손글씨나 특이한 수식인가요? 힌트 입력하기 (선택사항)</span>
            </button>
          </div>
          {showHintInput && (
            <input
              type="text"
              value={userHint}
              onChange={(e) => setUserHint(e.target.value)}
              placeholder="예: x에 대한 이차방정식, 3x3 에르미트 행렬, 물리 맥스웰 방정식 등"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          )}
        </div>
      )}

      {/* Quick Test Samples */}
      {!selectedImageUrl && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>빠른 테스트용 대표 예제 수식</span>
            </span>
            <span className="text-[11px] text-slate-400">클릭 시 즉시 변환 테스트</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SAMPLE_EQUATIONS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="flex flex-col items-start p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all text-xs group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {sample.category}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 group-hover:text-blue-700 truncate w-full">
                  {sample.title}
                </span>
                <span className="text-[11px] font-mono text-slate-500 truncate w-full mt-0.5">
                  {sample.hwpScript}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>수식 사진 촬영</span>
              </h4>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Overlay Guide */}
              <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  수식을 사각형 안에 맞춰주세요
                </span>
              </div>
            </div>

            {cameraError && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border-t border-red-100">
                {cameraError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>촬영하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
