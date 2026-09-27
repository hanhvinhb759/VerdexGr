/** Tham số prototype. Chưa phải trọng số đã kiểm định thực nghiệm. */

export function geometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  const product = values.reduce((acc, value) => acc * value, 1);
  return product ** (1 / values.length);
}

export function greenScore(ogs: number, tgs: number): number {
  const raw = 0.85 * ogs + 0.15 * tgs;
  return Math.min(raw, ogs + 10);
}

export function dataConfidence(evidence: number, consistency: number, recency: number, verification: number): number {
  return 0.2 * evidence + 0.2 * consistency + 0.15 * recency + 0.45 * verification;
}

export function confidenceBand(score: number): "Confirmed" | "Limited" | "Provisional" {
  if (score >= 70) return "Confirmed";
  if (score >= 50) return "Limited";
  return "Provisional";
}

export function gapBand(absGap: number): "Alignment" | "Moderate Gap" | "Significant Gap" {
  if (absGap <= 5) return "Alignment";
  if (absGap <= 15) return "Moderate Gap";
  return "Significant Gap";
}

export function round0(value: number): number {
  return Math.round(value);
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
