import React from "react";
import { X, Keyboard, CheckCircle2, Lightbulb, Copy } from "lucide-react";

interface HangulGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HangulGuideModal: React.FC<HangulGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              HWP
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                한글(HWP) 수식 편집기 사용 가이드
              </h3>
              <p className="text-xs text-slate-500">
                인식된 코드를 한글 문서에 3초 만에 넣는 방법
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-slate-800 text-sm">
          {/* Step-by-Step Walkthrough */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>수식 삽입 3단계 순서</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-semibold text-slate-800">수식 편집기 실행</span>
                <p className="text-xs text-slate-500">
                  한글 본문에서 수식을 삽입할 위치를 클릭한 뒤 단축키를 누릅니다.
                </p>
                <kbd className="mt-auto px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-center text-blue-700 shadow-2xs">
                  Ctrl + N, M
                </kbd>
              </div>

              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl flex flex-col gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="font-semibold text-slate-800">스크립트 붙여넣기</span>
                <p className="text-xs text-slate-500">
                  수식 편집기 하단의 명령 스크립트 입력창에 복사한 코드를 붙여넣습니다.
                </p>
                <kbd className="mt-auto px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-center text-blue-700 shadow-2xs">
                  Ctrl + V
                </kbd>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="font-semibold text-slate-800">본문에 수식 넣기</span>
                <p className="text-xs text-slate-500">
                  수식 삽입 및 닫기 단축키를 누르면 본문에 예쁜 수식으로 들어갑니다.
                </p>
                <kbd className="mt-auto px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-center text-blue-700 shadow-2xs">
                  Shift + Esc
                </kbd>
              </div>
            </div>
          </div>

          {/* Diagram Mockup */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-100 flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
              <span>[한글 수식 편집기 창 구조]</span>
              <span className="text-emerald-400 font-sans">하단 창에 붙여넣기 권장</span>
            </div>
            <div className="bg-slate-800/80 rounded p-3 text-slate-300 text-center py-5 font-serif italic text-sm border border-slate-700">
              [ 상단: 수식 그래픽 미리보기 영역 (실시간 렌더링) ]
            </div>
            <div className="bg-slate-950 rounded p-3 text-emerald-300 border border-emerald-600/40 relative">
              <span className="text-[10px] text-slate-400 absolute top-1 right-2">
                명령 스크립트 입력창 (여기에 Ctrl+V!)
              </span>
              <code>{"x = {-b +- sqrt{b^2 - 4ac}} over {2a}"}</code>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>한글 수식 작성 꿀팁</span>
            </h4>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-slate-800">수식 내 띄어쓰기</span>
                <span className="text-slate-500">
                  한글 수식은 일반 스페이스바를 무시합니다. 공백을 주려면 <code className="font-mono text-blue-600">~</code> (보통 간격) 또는 <code className="font-mono text-blue-600">`</code> (미세 간격)을 사용하세요.
                </span>
              </li>

              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-slate-800">단위 및 텍스트 (로만체)</span>
                <span className="text-slate-500">
                  변수는 기울임꼴로 표시되므로, 단위(<code className="font-mono">cm</code>, <code className="font-mono">kg</code>)나 한글은 <code className="font-mono text-blue-600">rm&#123;cm&#125;</code> 처럼 <code className="font-mono">rm</code>으로 감쌉니다.
                </span>
              </li>

              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-slate-800">자동 크기 조절 괄호</span>
                <span className="text-slate-500">
                  분수를 괄호로 감쌀 땐 단순 <code className="font-mono">()</code> 대신 <code className="font-mono text-blue-600">left ( ... right )</code>를 쓰면 분수 높이에 맞춰 괄호가 커집니다.
                </span>
              </li>

              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-slate-800">행렬 및 연립방정식</span>
                <span className="text-slate-500">
                  행렬은 <code className="font-mono text-blue-600">pmatrix &#123; a & b # c & d &#125;</code> 형식으로 작성하며, <code className="font-mono">&</code>는 열, <code className="font-mono">#</code>은 행을 나눕니다.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
