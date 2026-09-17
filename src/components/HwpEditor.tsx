import React, { useState, useRef } from "react";
import {
  Copy,
  Check,
  Code2,
  FileCode,
  Info,
  Layers,
  Sparkles,
  Keyboard,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { HWP_SHORTCUTS, HwpShortcut } from "../utils/hwpConverter";
import { SymbolInfo } from "../types";

interface HwpEditorProps {
  hwpScript: string;
  latex: string;
  explanation?: string;
  symbolsUsed?: SymbolInfo[];
  confidence?: "high" | "medium" | "low";
  onHwpChange: (newScript: string) => void;
  onLatexChange?: (newLatex: string) => void;
  onShowHangulGuide?: () => void;
}

export const HwpEditor: React.FC<HwpEditorProps> = ({
  hwpScript,
  latex,
  explanation,
  symbolsUsed = [],
  confidence = "high",
  onHwpChange,
  onShowHangulGuide,
}) => {
  const [activeTab, setActiveTab] = useState<"hwp" | "latex">("hwp");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("기본");
  const [showSymbolsBreakdown, setShowSymbolsBreakdown] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Copy to clipboard with visual feedback
  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2200);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Insert shortcut snippet into textarea at current cursor position
  const insertShortcut = (shortcut: HwpShortcut) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + shortcut.code + after;

    onHwpChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + shortcut.code.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const categories = ["기본", "미적분/기호", "괄호/행렬", "그리스문자", "공백/장식"];
  const filteredShortcuts = HWP_SHORTCUTS.filter(
    (s) => s.category === selectedCategory
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Code Editor Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Header & Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("hwp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "hwp"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>한글(HWP) 수식 스크립트</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("latex")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "latex"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-slate-600" />
              <span>LaTeX 코드</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Confidence indicator */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                confidence === "high"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : confidence === "medium"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{confidence === "high" ? "인식도 높음" : "인식 완료"}</span>
            </span>

            {/* Quick Copy Button */}
            <button
              type="button"
              id="btn-copy-main"
              onClick={() =>
                handleCopy(activeTab === "hwp" ? hwpScript : latex, activeTab)
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {copiedType === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{activeTab === "hwp" ? "한글 수식 복사" : "LaTeX 복사"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-4 bg-white">
          {activeTab === "hwp" ? (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="hwp-script-textarea"
                  value={hwpScript}
                  onChange={(e) => onHwpChange(e.target.value)}
                  rows={4}
                  className="w-full font-mono text-sm sm:text-base leading-relaxed p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 resize-y"
                  placeholder="한글 수식 스크립트 (예: {-b +- sqrt{b^2 - 4ac}} over {2a})"
                />
              </div>

              {/* Quick symbol insertion bar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">수식 기호 바로 삽입:</span>
                    <div className="flex items-center gap-1 ml-1 overflow-x-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            selectedCategory === cat
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">클릭 시 커서 위치에 삽입</span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50/60 rounded-lg border border-slate-100">
                  {filteredShortcuts.map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertShortcut(sc)}
                      title={`${sc.description} (${sc.code})`}
                      className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-xs font-mono text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                id="latex-script-textarea"
                value={latex}
                readOnly
                rows={4}
                className="w-full font-mono text-sm sm:text-base leading-relaxed p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-900 resize-y"
              />
              <p className="text-xs text-slate-500">
                * LaTeX 코드는 Notion, Obsidian, Overleaf, Word, 웹 수식(KaTeX/MathJax) 등에서 바로 활용할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* Step-by-step Hangul Paste Guide Banner */}
        <div className="bg-blue-50/70 border-t border-blue-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-blue-900 flex items-center gap-1.5 shrink-0">
              <Keyboard className="w-4 h-4 text-blue-600" />
              <span>한글(HWP)에 넣는 법:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
              <span>1.</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-blue-700 shadow-2xs">
                Ctrl + N, M
              </kbd>
              <span>(수식창 열기)</span>
              <span className="text-slate-400">→</span>
              <span>2.</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-blue-700 shadow-2xs">
                Ctrl + V
              </kbd>
              <span>(붙여넣기)</span>
              <span className="text-slate-400">→</span>
              <span>3.</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-blue-700 shadow-2xs">
                Shift + Esc
              </kbd>
              <span>(본문 삽입)</span>
            </div>
          </div>

          {onShowHangulGuide && (
            <button
              type="button"
              onClick={onShowHangulGuide}
              className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 shrink-0 hover:underline cursor-pointer"
            >
              <span>상세 가이드 보기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Explanation & Breakdown Section */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-slate-900 mb-1">수식 설명 및 해석</h4>
              <p className="text-slate-600 leading-relaxed">{explanation}</p>
            </div>
          </div>

          {/* Used Symbols Breakdown */}
          {symbolsUsed && symbolsUsed.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSymbolsBreakdown(!showSymbolsBreakdown)}
                className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>인식된 수식 구성 요소 및 한글 명령어 ({symbolsUsed.length}개)</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    showSymbolsBreakdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSymbolsBreakdown && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {symbolsUsed.map((sym, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-white rounded border border-slate-200 font-serif font-bold text-slate-800">
                          {sym.symbol}
                        </span>
                        <span className="text-slate-600">{sym.name}</span>
                      </div>
                      <code className="text-[11px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {sym.hwpCode}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
