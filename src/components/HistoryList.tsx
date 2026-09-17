import React from "react";
import { History, Trash2, Copy, Check, ArrowRight } from "lucide-react";
import { RecognizedEquation } from "../types";

interface HistoryListProps {
  history: RecognizedEquation[];
  onSelectEquation: (eq: RecognizedEquation) => void;
  onDeleteEquation: (id: string) => void;
  onClearHistory: () => void;
  currentId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectEquation,
  onDeleteEquation,
  onClearHistory,
  currentId,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyHwp = async (e: React.MouseEvent, id: string, script: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(script);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-800">
            최근 변환된 수식 ({history.length}건)
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[11px] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>기록 비우기</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {history.map((item) => {
          const isSelected = item.id === currentId;
          const formattedDate = new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectEquation(item)}
              className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-900 truncate">
                  {item.title || "수식"}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{formattedDate}</span>
              </div>

              <div className="bg-slate-50 p-1.5 rounded font-mono text-[11px] text-slate-700 truncate border border-slate-100 my-1">
                {item.hwpScript}
              </div>

              <div className="flex items-center justify-between mt-auto pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={(e) => handleCopyHwp(e, item.id, item.hwpScript)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>한글 코드 복사</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEquation(item.id);
                    }}
                    title="기록 삭제"
                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="text-slate-400 flex items-center">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
