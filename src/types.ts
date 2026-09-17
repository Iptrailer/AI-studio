export interface SymbolInfo {
  symbol: string;
  hwpCode: string;
  name: string;
}

export interface RecognizedEquation {
  id: string;
  title: string;
  hwpScript: string;
  latex: string;
  explanation: string;
  symbolsUsed: SymbolInfo[];
  confidence: "high" | "medium" | "low";
  imageUrl: string;
  createdAt: number;
}

export interface SampleEquation {
  id: string;
  title: string;
  category: string;
  latex: string;
  hwpScript: string;
  description: string;
  svgDataUrl: string;
}
