import React, { useMemo, useState } from "react";
import katex from "katex";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle } from "lucide-react";

interface MathPreviewProps {
  latex: string;
  title?: string;
  className?: string;
  showControls?: boolean;
}

export const MathPreview: React.FC<MathPreviewProps> = ({
  latex,
  title,
  className = "",
  showControls = true,
}) => {
  const [scale, setScale] = useState<number>(1);

  const { html, error } = useMemo(() => {
    if (!latex || !latex.trim()) {
      return { html: "", error: null };
    }

    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        output: "htmlAndMathml",
      });
      return { html: rendered, error: null };
    } catch (err: unknown) {
      console.warn("KaTeX rendering error:", err);
      const msg = err instanceof Error ? err.message : "수식 렌더링에 실패했습니다.";
      return { html: "", error: msg };
    }
  }, [latex]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.7));
  const handleReset = () => setScale(1);

  if (!latex || !latex.trim()) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 ${className}`}>
        <p className="text-sm font-medium">수식을 입력하거나 이미지를 업로드하면 미리보기가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700">
          <span className="truncate">{title}</span>
          <span className="text-[11px] font-normal text-slate-500">KaTeX 실시간 렌더링</span>
        </div>
      )}

      {/* Math Display Area */}
      <div className="relative min-h-[120px] flex items-center justify-center p-6 overflow-x-auto bg-gradient-to-b from-white to-slate-50/30">
        {error ? (
          <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>수식 문법 확인 중: {error}</span>
          </div>
        ) : (
          <div
            id="rendered-math-container"
            style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 py-2 select-text text-slate-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      {/* Floating Zoom Controls */}
      {showControls && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/90 border-t border-slate-100 text-xs text-slate-500">
          <span className="text-[11px] text-slate-400">배율: {Math.round(scale * 100)}%</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.7}
              title="축소"
              className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-30 text-slate-600 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="원래 크기"
              className="p-1 rounded hover:bg-slate-200/70 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 2.0}
              title="확대"
              className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-30 text-slate-600 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
