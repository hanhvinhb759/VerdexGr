import { CRITERIA, PILLARS, type ItemStatus, type PillarId, type VerifyLevel } from "@/lib/catalog";
import { confidenceBand, dataConfidence, gapBand, geometricMean, greenScore, round0, round1 } from "@/lib/scoring";

export type ItemState = {
  score: number;
  status: ItemStatus;
  verify: VerifyLevel;
  evidence: boolean;
  days: number;
  clash: boolean;
};

const VERIFY_SCORE: Record<VerifyLevel, number> = {
  self: 30,
  evidence: 60,
  cross: 80,
  external: 100,
};

export function recencyScore(days: number): number {
  if (days <= 30) return 100;
  if (days <= 90) return 85;
  if (days <= 180) return 70;
  if (days <= 365) return 50;
  return 25;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toneOf(score: number | null): "steady" | "watch" | "weak" | "off" {
  if (score === null) return "off";
  if (score >= 75) return "steady";
  if (score >= 60) return "watch";
  return "weak";
}

export function buildVerdict(
  items: Record<string, ItemState>,
  perception: { count: number; score: number },
  history: { period: string; score: number }[],
) {
  const rows = CRITERIA.map((criterion) => ({ ...criterion, ...items[criterion.id] }));
  const applicable = rows.filter((row) => row.status !== "na");

  const evidenceRatio = applicable.length === 0 ? 0 : (applicable.filter((row) => row.evidence).length / applicable.length) * 100;
  const comparable = applicable.filter((row) => row.verify === "cross" || row.verify === "external");
  const clashes = comparable.filter((row) => row.clash).length;
  let consistency = 15;
  if (comparable.length >= 2) {
    if (clashes === 0) consistency = 100;
    else if (clashes === 1) consistency = 80;
    else if (clashes === 2) consistency = 60;
    else consistency = 30;
  }
  const recency = mean(applicable.map((row) => recencyScore(row.days)));
  const verification = mean(applicable.map((row) => VERIFY_SCORE[row.verify]));
  const confidenceExact = dataConfidence(evidenceRatio, consistency, recency, verification);
  const confidence = round0(confidenceExact);

  const pillars = PILLARS.map((pillar) => {
    const mine = rows.filter((row) => row.pillar === pillar.id);
    const inScope = mine.filter((row) => row.status !== "na");
    const insufficient = inScope.some((row) => row.status === "insufficient");
    const notDone = inScope.some((row) => row.status === "not_implemented");
    const implemented = inScope.filter((row) => row.status === "implemented");
    const applicablePillar = inScope.length > 0;
    const eligible = applicablePillar && !insufficient && !notDone && implemented.length > 0;
    const score = eligible ? mean(implemented.map((row) => row.score)) : null;
    const weak = implemented.slice().sort((a, b) => a.score - b.score)[0];
    let status = "Implemented";
    if (!applicablePillar) status = "Not Applicable";
    else if (insufficient) status = "Insufficient Data";
    else if (notDone) status = "Not Implemented";
    const note = !eligible
      ? "Trụ này chưa đưa vào điểm tổng hợp."
      : weak
        ? `${weak.name} đang ở ${round0(weak.score)}.`
        : "";
    return {
      ...pillar,
      score: score === null ? null : round0(score),
      exact: score,
      status,
      eligible,
      applicable: applicablePillar,
      tone: toneOf(score === null ? null : round0(score)),
      note,
    };
  });

  const operational = pillars.filter((pillar) => pillar.inOgs && pillar.applicable);
  const eligibleOps = operational.filter((pillar) => pillar.eligible && pillar.exact !== null);
  const ogs = eligibleOps.length >= 2 ? geometricMean(eligibleOps.map((pillar) => pillar.exact as number)) : null;
  const tgsPillar = pillars.find((pillar) => pillar.id === "TGS");
  const tgs = tgsPillar?.exact ?? null;
  const raw = ogs !== null && tgs !== null ? 0.85 * ogs + 0.15 * tgs : null;
  const cap = ogs !== null ? ogs + 10 : null;
  const gs = ogs !== null && tgs !== null ? greenScore(ogs, tgs) : null;
  const published = gs === null ? null : round0(gs);

  let coverageKind: "full" | "provisional" | "insufficient" = "insufficient";
  let coverageLabel = "Insufficient Assessment Scope";
  if (eligibleOps.length >= 2 && eligibleOps.length === operational.length) {
    coverageKind = "full";
    coverageLabel = "Full Applicable Coverage";
  } else if (eligibleOps.length >= 2) {
    coverageKind = "provisional";
    coverageLabel = "Provisional – Incomplete Coverage";
  }
  const coverageDetail = `${eligibleOps.length}/${operational.length} trụ vận hành đủ điều kiện`;

  const gapOfficial = perception.count >= 50 && coverageKind !== "insufficient" && confidence >= 50 && published !== null;
  const gap = published === null ? null : published - round0(perception.score);
  const band = gap === null ? null : gapBand(Math.abs(gap));
  let gapText = "Chưa đủ điều kiện công bố khoảng cách chính thức.";
  if (gapOfficial && gap !== null && band) {
    if (gap < -5) gapText = "Khách hàng cảm nhận xanh hơn dữ liệu. Đây là tín hiệu cần kiểm tra, không phải kết luận greenwashing.";
    else if (gap > 5) gapText = "Điểm dữ liệu cao hơn nhận thức. Vấn đề nằm ở cách công bố, không phải làm hồ sơ trông xanh hơn.";
    else gapText = "Điểm dữ liệu và nhận thức đang gần nhau. Giữ nhịp cập nhật và thu phản hồi.";
  } else if (perception.count < 20) gapText = "Dưới 20 đánh giá hợp lệ. Chưa hiển thị nhận thức như một kết luận.";
  else if (perception.count < 50) gapText = "Nhận thức ở mức tham khảo. Chưa tính Gap chính thức.";

  const weakest = eligibleOps.slice().sort((a, b) => (a.exact ?? 0) - (b.exact ?? 0))[0] ?? null;
  const trend = [
    ...history,
    ...(published === null ? [] : [{ period: "Hiện tại", score: published }]),
  ];

  const loop = [
    { id: "data", label: "Dữ liệu", state: "done" as const, detail: `${applicable.length} tiêu chí đang trong phạm vi áp dụng.` },
    { id: "check", label: "Xác thực", state: "done" as const, detail: `Validation and Verification đang ở ${round0(verification)}. Chưa có xác minh ngoài nếu số mục externally verified bằng 0.` },
    { id: "score", label: "Green Score", state: published === null ? ("wait" as const) : ("done" as const), detail: published === null ? "Chưa đủ hai trụ vận hành để công bố OGS." : `Điểm công bố ${published}, kèm ${coverageLabel}.` },
    { id: "voice", label: "Nhận thức", state: perception.count >= 20 ? ("done" as const) : ("wait" as const), detail: `${perception.count} đánh giá. Ngưỡng tham khảo là 20, ngưỡng Gap chính thức là 50.` },
    { id: "gap", label: "Perception Gap", state: gapOfficial ? ("done" as const) : ("wait" as const), detail: gapText },
    { id: "dx", label: "Chẩn đoán", state: "now" as const, detail: weakest ? `${weakest.vi} là trụ vận hành thấp nhất trong phạm vi đã tính.` : "Chưa đủ trụ để chẩn đoán điểm nghẽn." },
    { id: "act", label: "Cải thiện", state: "wait" as const, detail: "Khuyến nghị lấy từ thư viện gắn với tiêu chí thấp. Đánh dấu đã làm không tự nâng điểm." },
    { id: "redo", label: "Đánh giá lại", state: "wait" as const, detail: "Chốt kỳ khi muốn lưu điểm hiện tại vào diễn biến." },
  ];

  return {
    pillars,
    rows,
    ogs,
    ogsLabel: ogs === null ? "—" : String(round1(ogs)),
    rawScore: raw === null ? null : round1(raw),
    cap: cap === null ? null : round1(cap),
    greenScore: published,
    confidence,
    confidenceExact: round1(confidenceExact),
    confidenceBand: confidenceBand(confidence),
    parts: {
      evidence: round0(evidenceRatio),
      consistency: round0(consistency),
      recency: round0(recency),
      verification: round0(verification),
    },
    coverageKind,
    coverageLabel,
    coverageDetail,
    perception: round0(perception.score),
    perceptionExact: round1(perception.score),
    reviewCount: perception.count,
    gap,
    absGap: gap === null ? null : Math.abs(gap),
    gapBand: band,
    gapOfficial,
    gapText,
    weakest,
    trend,
    loop,
    externalCount: applicable.filter((row) => row.verify === "external").length,
    evidenceMissing: applicable.filter((row) => !row.evidence).length,
  };
}

export type Verdict = ReturnType<typeof buildVerdict>;

export function pillarItems(verdict: Verdict, id: PillarId) {
  return verdict.rows.filter((row) => row.pillar === id);
}
