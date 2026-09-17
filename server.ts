import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger payload for images
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "hwp-math-converter" });
});

// Equation recognition API
app.post("/api/recognize-equation", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", userHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 전달되지 않았습니다." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 설정에서 API 키를 확인해주세요.",
      });
    }

    // Clean base64 string if data URL prefix was included
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const systemPrompt = `당신은 한글(한컴오피스 HWP / 한글 2018/2020/2022/2024) 수식 편집기 및 수학 기호 전문 인공지능입니다.
사용자가 제공한 이미지에 포함된 수학 수식(손글씨, 인쇄물, 캡처 화면, 교재 등)을 정밀하게 판독하여, 한글과컴퓨터 한글 문서의 '수식 편집기(Equation Editor)' 전용 스크립트 코드와 표준 LaTeX 코드로 완벽하게 변환해야 합니다.

[한글(HWP) 수식 스크립트 문법 필수 규칙]:
1. 분수: 반드시 '{분자} over {분모}' 형식을 사용합니다. 절대 '\\frac'을 사용하지 마십시오. (예: '{a + b} over {c}')
2. 첨자: 위첨자는 '^', 아래첨자는 '_'를 사용하며, 여러 글자는 중괄호로 묶습니다. (예: 'x_{n}^{2}')
3. 제곱근(루트): 'sqrt {내용}' 또는 'root {n} of {내용}'을 사용합니다.
4. 그리스 문자:
   - 소문자: alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi, pi, rho, sigma, tau, phi, chi, psi, omega
   - 대문자: ALPHA, BETA, GAMMA, DELTA, THETA, LAMBDA, PI, SIGMA, PHI, PSI, OMEGA
5. 적분 & 합:
   - 정적분: 'int_{하한}^{상한} {피적분함수} dx' (다중적분: iint, iiint, oint)
   - 합/곱: 'sum_{k=1}^{n} {일반항}', 'prod_{i=1}^{n} {항}'
6. 극한(Limit): 'lim_{x -> 0}' 또는 'lim_{x -> inf}' (화살표는 '->' 또는 'rightarrow')
7. 괄호 크기 자동 조절: 'left ( ... right )', 'left { ... right }', 'left [ ... right ]', 'left | ... right |'
8. 행렬(Matrix) 및 조건식(Cases):
   - 행렬: 'pmatrix { a & b # c & d }' 또는 'bmatrix { a & b # c & d }' (# 기호가 행 구분, & 기호가 열 구분)
   - 조건식: 'cases { x & {if ~ x >= 0} # -x & {if ~ x < 0} }'
9. 공백 및 특수기호:
   - 띄어쓰기: '~' (보통 간격 빈칸), 작은따옴표/백틱 (미세 간격 빈칸)
   - 사칙연산 및 부호: '+-', '-+', 'times' (×), 'div' (÷), 'cdot' (·), 'cdots' (⋯)
   - 관계연산자: '<=', '>=', '!=', 'neq', 'approx', 'equiv', 'propto'
   - 벡터/장식: 'vec {v}', 'bar {x}', 'hat {x}', 'dot {x}', 'ddot {x}'
   - 영문 정체(로만체): 단위나 텍스트는 'rm {cm}', 'rm {kg}'

LaTeX 코드도 제공하여 웹 미리보기(KaTeX) 및 타 소프트웨어 호환이 가능하도록 하십시오.`;

    const promptText = `제공된 이미지 속의 수식을 인식하고, 한글(HWP) 수식 편집기 스크립트와 LaTeX로 변환해주세요.${
      userHint ? `\n(참고 힌트: ${userHint})` : ""
    }`;

    const CANDIDATE_MODELS = [
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];

    let lastError: unknown = null;
    let parsedData: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      // Try up to 2 attempts per model with short delay on 503/429
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[수식 인식 시도] 모델: ${modelName}, 시도 횟수: ${attempt}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  hwpScript: {
                    type: Type.STRING,
                    description: "한글(HWP) 수식 편집기에서 바로 붙여넣기 가능한 수식 스크립트 코드",
                  },
                  latex: {
                    type: Type.STRING,
                    description: "표준 LaTeX 수식 코드 (KaTeX 렌더링용, $ 기호 제외)",
                  },
                  title: {
                    type: Type.STRING,
                    description: "수식의 이름 또는 요약 (예: 이차방정식 근의 공식, 정규분포 확률밀도함수 등)",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "인식된 수식의 수학적 의미 및 구조 설명 (한국어)",
                  },
                  symbolsUsed: {
                    type: Type.ARRAY,
                    description: "수식에 사용된 핵심 기호 및 한글 수식 명령어 목록",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING, description: "실제 기호 모양" },
                        hwpCode: { type: Type.STRING, description: "한글 수식 명령어" },
                        name: { type: Type.STRING, description: "기호 명칭 및 용도 설명" },
                      },
                      required: ["symbol", "hwpCode", "name"],
                    },
                  },
                  confidence: {
                    type: Type.STRING,
                    enum: ["high", "medium", "low"],
                    description: "인식 신뢰도",
                  },
                },
                required: ["hwpScript", "latex", "title", "explanation", "confidence"],
              },
            },
          });

          const responseText = response.text;
          if (!responseText) {
            throw new Error("AI 모델로부터 응답을 받지 못했습니다.");
          }

          // Clean possible markdown code fences
          const cleanedText = responseText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

          parsedData = JSON.parse(cleanedText);
          break; // Success, break attempt loop
        } catch (err: unknown) {
          lastError = err;
          const errString = String(err);
          const isOverloaded =
            errString.includes("503") ||
            errString.includes("UNAVAILABLE") ||
            errString.includes("high demand") ||
            errString.includes("RESOURCE_EXHAUSTED") ||
            errString.includes("429");

          console.warn(`[수식 인식 오류] 모델 ${modelName} 시도 ${attempt} 실패:`, errString);

          if (isOverloaded && attempt < 2) {
            // Wait 1.2s before retrying same model
            await new Promise((resolve) => setTimeout(resolve, 1200));
            continue;
          }
          // If 2nd attempt failed or not an overload issue, fall back to next model
          break;
        }
      }

      if (parsedData) {
        break; // Successfully got parsed response from one of the models
      }
    }

    if (!parsedData) {
      const errString = String(lastError);
      if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand")) {
        return res.status(503).json({
          error: "현재 Google AI 모델 서버에 일시적인 사용량 급증(503)이 발생했습니다. 2~3초 후 다시 시도해주세요.",
        });
      }
      throw lastError || new Error("수식을 인식하지 못했습니다.");
    }

    return res.json(parsedData);
  } catch (error: unknown) {
    console.error("수식 인식 중 최종 오류 발생:", error);
    const errorMessage = error instanceof Error ? error.message : "수식을 인식하지 못했습니다.";
    return res.status(500).json({ error: errorMessage });
  }
});

// Start Express server and Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`한글 수식 변환기 서버 실행 중: http://localhost:${PORT}`);
  });
}

startServer();
