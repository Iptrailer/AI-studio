import { SampleEquation } from "../types";

/**
 * Pre-configured sample equations for testing without needing to find an image file first.
 */
export const SAMPLE_EQUATIONS: SampleEquation[] = [
  {
    id: "quadratic",
    title: "근의 공식 (이차방정식)",
    category: "대수학",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    hwpScript: "x = {-b +- sqrt{b^2 - 4ac}} over {2a}",
    description: "이차방정식 ax² + bx + c = 0 의 해를 구하는 공식",
    svgDataUrl: "", // Will be generated or dynamically previewed
  },
  {
    id: "normal-dist",
    title: "정규분포 확률밀도함수",
    category: "통계학",
    latex: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",
    hwpScript: "f(x) = {1} over {sigma sqrt{2 pi}} e^{-{1} over {2} left ( {x - mu} over {sigma} right )^2}",
    description: "평균 μ, 표준편차 σ를 가지는 가우스 정규분포 함수",
    svgDataUrl: "",
  },
  {
    id: "definite-integral",
    title: "가우스 적분 (오일러-푸아송)",
    category: "미적분학",
    latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}",
    hwpScript: "int_{-inf}^{inf} {e^{-x^2}} dx = sqrt{pi}",
    description: "확률론 및 통계물리학의 기초가 되는 가우스 적분 공식",
    svgDataUrl: "",
  },
  {
    id: "matrix-inversion",
    title: "2x2 역행렬 공식",
    category: "선형대수학",
    latex: "A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}",
    hwpScript: "A^{-1} = {1} over {ad - bc} pmatrix { d & -b # -c & a }",
    description: "행렬식 det(A) = ad - bc 가 0이 아닐 때의 2차 정방행렬의 역행렬",
    svgDataUrl: "",
  },
  {
    id: "euler-identity",
    title: "오일러 항등식",
    category: "해석학",
    latex: "e^{i\\pi} + 1 = 0",
    hwpScript: "e^{i pi} + 1 = 0",
    description: "수학에서 가장 아름다운 공식으로 꼽히는 5대 기본 상수의 연결식",
    svgDataUrl: "",
  },
];
