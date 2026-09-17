/**
 * Utility to assist with Hancom Hangul (한글 HWP) Equation Editor script parsing,
 * converting HWP script to previewable LaTeX, and providing symbol shortcuts.
 */

export interface HwpShortcut {
  label: string;
  code: string;
  description: string;
  category: "기본" | "미적분/기호" | "괄호/행렬" | "그리스문자" | "공백/장식";
}

export const HWP_SHORTCUTS: HwpShortcut[] = [
  // 기본
  { label: "분수", code: "{분자} over {분모}", description: "분수 ({a} over {b})", category: "기본" },
  { label: "루트", code: "sqrt{x}", description: "제곱근 (sqrt{x})", category: "기본" },
  { label: "n제곱근", code: "root {n} of {x}", description: "n차 거듭제곱근", category: "기본" },
  { label: "±", code: "+-", description: "플러스 마이너스 부호", category: "기본" },
  { label: "×", code: "times", description: "곱하기 곱셈 기호", category: "기본" },
  { label: "÷", code: "div", description: "나누기 나눗셈 기호", category: "기본" },
  { label: "·", code: "cdot", description: "가운데 점 (내적/곱셈)", category: "기본" },
  { label: "위첨자", code: "^{2}", description: "지수 / 위첨자", category: "기본" },
  { label: "아래첨자", code: "_{1}", description: "인덱스 / 아래첨자", category: "기본" },

  // 미적분 / 기호
  { label: "정적분", code: "int_{a}^{b} {f(x)} dx", description: "구간 [a, b] 정적분", category: "미적분/기호" },
  { label: "합 (시그마)", code: "sum_{k=1}^{n} {a_k}", description: "수열의 합 sum", category: "미적분/기호" },
  { label: "극한 (lim)", code: "lim_{x -> 0} {f(x)}", description: "함수의 극한", category: "미적분/기호" },
  { label: "무한대 (∞)", code: "inf", description: "무한대 기호", category: "미적분/기호" },
  { label: "화살표 (→)", code: "->", description: "오른쪽 화살표", category: "미적분/기호" },
  { label: "화살표 (⇒)", code: "=>", description: "함의 화살표", category: "미적분/기호" },
  { label: "≤", code: "<=", description: "작거나 같음", category: "미적분/기호" },
  { label: "≥", code: ">=", description: "크거나 같음", category: "미적분/기호" },
  { label: "≠", code: "!=", description: "같지 않음", category: "미적분/기호" },
  { label: "≒", code: "approx", description: "근삿값 기호", category: "미적분/기호" },

  // 괄호 및 행렬
  { label: "( ) 괄호", code: "left ( 내용 right )", description: "자동 크기 조절 소괄호", category: "괄호/행렬" },
  { label: "{ } 중괄호", code: "left { 내용 right }", description: "자동 크기 조절 중괄호", category: "괄호/행렬" },
  { label: "[ ] 대괄호", code: "left [ 내용 right ]", description: "자동 크기 조절 대괄호", category: "괄호/행렬" },
  { label: "| | 절댓값", code: "left | 내용 right |", description: "자동 크기 조절 절댓값", category: "괄호/행렬" },
  { label: "2x2 행렬", code: "pmatrix { a & b # c & d }", description: "2x2 둥근 행렬 (#는 행 구분, &는 열 구분)", category: "괄호/행렬" },
  { label: "조건식 (cases)", code: "cases { 1 & {if ` x >= 0} # 0 & {if ` x < 0} }", description: "조각정의함수/조건식", category: "괄호/행렬" },

  // 그리스 문자
  { label: "α (alpha)", code: "alpha", description: "그리스 소문자 알파", category: "그리스문자" },
  { label: "β (beta)", code: "beta", description: "그리스 소문자 베타", category: "그리스문자" },
  { label: "γ (gamma)", code: "gamma", description: "그리스 소문자 감마", category: "그리스문자" },
  { label: "θ (theta)", code: "theta", description: "그리스 소문자 세타 (각도)", category: "그리스문자" },
  { label: "π (pi)", code: "pi", description: "원주율 파이", category: "그리스문자" },
  { label: "σ (sigma)", code: "sigma", description: "그리스 소문자 시그마 (표준편차)", category: "그리스문자" },
  { label: "λ (lambda)", code: "lambda", description: "그리스 소문자 람다 (파장/고윳값)", category: "그리스문자" },
  { label: "μ (mu)", code: "mu", description: "그리스 소문자 뮤 (평균/마이크로)", category: "그리스문자" },
  { label: "ω (omega)", code: "omega", description: "그리스 소문자 오메가", category: "그리스문자" },
  { label: "Δ (DELTA)", code: "DELTA", description: "그리스 대문자 델타 (변화량)", category: "그리스문자" },
  { label: "Σ (SIGMA)", code: "SIGMA", description: "그리스 대문자 시그마", category: "그리스문자" },

  // 공백 및 장식
  { label: "공백 (~)", code: "~", description: "보통 공백 (띄어쓰기 한 칸)", category: "공백/장식" },
  { label: "미세공백 (`)", code: "`", description: "미세 간격 띄어쓰기", category: "공백/장식" },
  { label: "벡터 (vec)", code: "vec {v}", description: "화살표 벡터 기호", category: "공백/장식" },
  { label: "평균바 (bar)", code: "bar {x}", description: "상단 가로줄 (평균/켤레)", category: "공백/장식" },
  { label: "단위 (rm)", code: "rm{cm}", description: "로만 정체 폰트 (단위 등)", category: "공백/장식" },
];

/**
 * Converts Hancom Hangul equation script into KaTeX-compatible LaTeX for instant live preview
 * when the user modifies the HWP script.
 */
export function convertHwpToLatex(hwp: string): string {
  if (!hwp || !hwp.trim()) return "";

  let result = hwp;

  // 1. Handle fractions: {A} over {B} -> \frac{A}{B}
  // Repeatedly replace balanced braces or simple tokens with 'over'
  let fractionRegex = /\{([^{}]+)\}\s*over\s*\{([^{}]+)\}/g;
  let prevResult = "";
  while (prevResult !== result) {
    prevResult = result;
    result = result.replace(fractionRegex, "\\frac{$1}{$2}");
  }

  // Also handle simple token over token: e.g., a over b
  result = result.replace(/([a-zA-Z0-9_]+)\s+over\s+([a-zA-Z0-9_]+)/g, "\\frac{$1}{$2}");

  // 2. Square roots: sqrt {X} -> \sqrt{X}
  result = result.replace(/sqrt\s*\{([^}]+)\}/g, "\\sqrt{$1}");
  result = result.replace(/sqrt\s+([a-zA-Z0-9])/g, "\\sqrt{$1}");

  // Root n of X: root {n} of {x} -> \sqrt[n]{x}
  result = result.replace(/root\s*\{?([^}]+?)\}?\s*of\s*\{([^}]+)\}/g, "\\sqrt[$1]{$2}");

  // 3. Integrals and summations
  result = result.replace(/\bint\b/g, "\\int");
  result = result.replace(/\biint\b/g, "\\iint");
  result = result.replace(/\biiint\b/g, "\\iiint");
  result = result.replace(/\boint\b/g, "\\oint");
  result = result.replace(/\bsum\b/g, "\\sum");
  result = result.replace(/\bprod\b/g, "\\prod");
  result = result.replace(/\blim\b/g, "\\lim");

  // 4. Arrows and relations
  result = result.replace(/->|rightarrow/g, "\\to ");
  result = result.replace(/=>/g, "\\Rightarrow ");
  result = result.replace(/<->/g, "\\leftrightarrow ");
  result = result.replace(/<=/g, "\\le ");
  result = result.replace(/>=/g, "\\ge ");
  result = result.replace(/!=/g, "\\ne ");
  result = result.replace(/\bapprox\b/g, "\\approx ");
  result = result.replace(/\bequiv\b/g, "\\equiv ");
  result = result.replace(/\bpropto\b/g, "\\propto ");
  result = result.replace(/\binf\b/g, "\\infty ");

  // 5. Operators
  result = result.replace(/\b\+-\b|\bpm\b/g, "\\pm ");
  result = result.replace(/\b-\+\b|\bmp\b/g, "\\mp ");
  result = result.replace(/\btimes\b/g, "\\times ");
  result = result.replace(/\bdiv\b/g, "\\div ");
  result = result.replace(/\bcdot\b/g, "\\cdot ");
  result = result.replace(/\bcdots\b/g, "\\cdots ");

  // 6. Greek letters (lowercase)
  const greekLower = [
    "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
    "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "rho", "sigma",
    "tau", "upsilon", "phi", "chi", "psi", "omega"
  ];
  for (const g of greekLower) {
    const reg = new RegExp(`\\b${g}\\b`, "g");
    result = result.replace(reg, `\\${g} `);
  }

  // Greek letters (uppercase)
  const greekUpper = [
    "ALPHA", "BETA", "GAMMA", "DELTA", "THETA", "LAMBDA", "PI", "SIGMA", "PHI", "PSI", "OMEGA"
  ];
  for (const G of greekUpper) {
    const name = G.charAt(0) + G.slice(1).toLowerCase();
    const reg = new RegExp(`\\b${G}\\b`, "g");
    result = result.replace(reg, `\\${name} `);
  }

  // 7. Matrices: pmatrix { a & b # c & d } -> \begin{pmatrix} a & b \\ c & d \end{pmatrix}
  result = result.replace(/pmatrix\s*\{([^}]+)\}/g, (_match, body) => {
    const rows = body.replace(/#/g, " \\\\ ");
    return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
  });
  result = result.replace(/bmatrix\s*\{([^}]+)\}/g, (_match, body) => {
    const rows = body.replace(/#/g, " \\\\ ");
    return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
  });
  result = result.replace(/cases\s*\{([^}]+)\}/g, (_match, body) => {
    const rows = body.replace(/#/g, " \\\\ ");
    return `\\begin{cases} ${rows} \\end{cases}`;
  });

  // 8. Brackets
  result = result.replace(/left\s*\(/g, "\\left(");
  result = result.replace(/right\s*\)/g, "\\right)");
  result = result.replace(/left\s*\[/g, "\\left[");
  result = result.replace(/right\s*\]/g, "\\right]");
  result = result.replace(/left\s*\{/g, "\\left\\{");
  result = result.replace(/right\s*\}/g, "\\right\\}");
  result = result.replace(/left\s*\|/g, "\\left|");
  result = result.replace(/right\s*\|/g, "\\right|");

  // 9. Accents & Roman
  result = result.replace(/vec\s*\{([^}]+)\}/g, "\\vec{$1}");
  result = result.replace(/bar\s*\{([^}]+)\}/g, "\\bar{$1}");
  result = result.replace(/hat\s*\{([^}]+)\}/g, "\\hat{$1}");
  result = result.replace(/dot\s*\{([^}]+)\}/g, "\\dot{$1}");
  result = result.replace(/ddot\s*\{([^}]+)\}/g, "\\ddot{$1}");
  result = result.replace(/rm\s*\{([^}]+)\}/g, "\\mathrm{$1}");

  // 10. Spaces: ~ -> \;, ` -> \,
  result = result.replace(/~/g, "\\; ");
  result = result.replace(/`/g, "\\, ");

  return result;
}
