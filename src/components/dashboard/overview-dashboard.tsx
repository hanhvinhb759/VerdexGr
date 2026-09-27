import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "@tanstack/react-router";
import { PLANS } from "@/lib/catalog";
import { useVerdict, useVerdex } from "@/lib/store";
import { cn } from "@/lib/utils";
import { iconForPillar } from "@/components/shell/enterprise-shell";

function ScoreRing({ value }: { value: number }) {
  const size = 148;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Green Score ${value} trên 100`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-slate-200"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-emerald-600"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function toneClass(tone: "steady" | "watch" | "weak" | "off") {
  if (tone === "weak") return "bg-rose-500";
  if (tone === "watch") return "bg-amber-500";
  if (tone === "off") return "bg-slate-300";
  return "bg-emerald-600";
}

export function OverviewDashboard() {
  const [chartReady, setChartReady] = useState(false);
  const [stepId, setStepId] = useState("dx");
  const verdict = useVerdict();
  const profile = useVerdex((state) => state.profile);
  const plan = useVerdex((state) => state.plan);
  const planName = PLANS.find((item) => item.id === plan)?.name ?? plan;
  const activeStep = verdict.loop.find((step) => step.id === stepId) ?? verdict.loop[5];

  useEffect(() => {
    setChartReady(true);
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Phân hệ vận hành</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Bảng tổng quan doanh nghiệp</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {profile.name} · {profile.code}. Hồ sơ cập nhật {profile.updated}. Điểm số không thay đổi theo gói {planName}.
          </p>
        </div>
        <a
          href="#cong-thuc"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"
        >
          Xem cách tính điểm
        </a>
      </header>

      <section className="grid gap-4 lg:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <p className="text-sm font-medium text-slate-500">Green Score</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative grid place-items-center">
              <ScoreRing value={verdict.greenScore ?? 0} />
              <p className="absolute text-center">
                <span className="block text-4xl font-semibold tracking-tight tabular-nums">{verdict.greenScore ?? "—"}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </p>
            </div>
            <div>
              <p className="text-sm leading-6 text-slate-600">
                Không phải chứng nhận xanh. Đọc cùng phạm vi đánh giá và độ tin cậy dữ liệu.
              </p>
              <p className="mt-3 text-xs font-medium text-emerald-800">Operational Green Score {verdict.ogsLabel}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Assessment Coverage</p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{verdict.coverageLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{verdict.coverageDetail}. Tiêu chí Not Implemented hoặc Insufficient Data không bị tính như điểm không.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Data Confidence</p>
              <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">
                {verdict.confidence}
                <span className="text-base font-medium text-slate-500"> / 100</span>
              </p>
              <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {verdict.confidenceBand}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Minh chứng đầy đủ {verdict.parts.evidence}, nhất quán {verdict.parts.consistency}, cập nhật {verdict.parts.recency}, xác thực {verdict.parts.verification}.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Bốn trụ">
        <h2 className="text-lg font-semibold tracking-tight">Ba trụ vận hành và trụ minh bạch</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {verdict.pillars.map((pillar) => {
            const Icon = iconForPillar(pillar.id);
            return (
              <article key={pillar.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">{pillar.score}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{pillar.vi}</h3>
                <p className="text-xs text-slate-500">
                  {pillar.id} · {pillar.name}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn("h-full rounded-full", toneClass(pillar.tone))} style={{ width: `${pillar.score ?? 0}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.note}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  {pillar.status}
                  {pillar.inOgs ? " · tính vào OGS" : " · không tính vào OGS"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h2 className="text-lg font-semibold tracking-tight">Diễn biến Green Score</h2>
          <p className="mt-1 text-sm text-slate-500">Sáu kỳ gần nhất, sau làm tròn số nguyên.</p>
          <div className="mt-4 h-56">
            {chartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={verdict.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-slate-200)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: "var(--color-slate-500)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--color-slate-500)", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-white)",
                      border: "1px solid var(--color-slate-200)",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Area type="monotone" dataKey="score" name="Green Score" stroke="var(--color-emerald-700)" fill="var(--color-emerald-100)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-slate-100" />
            )}
          </div>
        </article>

        <article id="cong-thuc" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight">Cách cộng điểm</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-600">OGS, trung bình nhân P, T, R</dt>
              <dd className="font-semibold tabular-nums">{verdict.ogsLabel}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-600">Trước trần: 85% OGS + 15% TGS</dt>
              <dd className="font-semibold tabular-nums">{verdict.rawScore ?? "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-600">Trần OGS + 10</dt>
              <dd className="font-semibold tabular-nums">{verdict.cap ?? "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-medium text-slate-900">Green Score công bố</dt>
              <dd className="text-lg font-semibold text-emerald-800 tabular-nums">{verdict.greenScore ?? "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Trọng số và trần là tham số prototype. Trung bình nhân buộc trụ yếu phải được nâng, không để một trụ cao che trụ thấp.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Vòng cải thiện khép kín</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn một chặng để xem trạng thái hiện tại của hồ sơ.</p>
          </div>
          <p className="text-sm font-medium text-indigo-700">Đang ở chẩn đoán</p>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {verdict.loop.map((step, index) => {
            const selected = step.id === stepId;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setStepId(step.id)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left",
                    selected ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      step.state === "now" && "bg-indigo-600 text-indigo-50",
                      step.state === "done" && "bg-emerald-100 text-emerald-800",
                      step.state === "wait" && "bg-slate-100 text-slate-500",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{step.label}</span>
                    <span className="block text-xs text-slate-500">
                      {step.state === "done" ? "Đã xong" : step.state === "now" ? "Đang xử lý" : "Chưa tới"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-950">{activeStep.detail}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-rose-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-wide text-rose-700 uppercase">Điểm nghẽn vận hành</p>
          <h2 className="mt-2 text-base font-semibold">{verdict.weakest ? `${verdict.weakest.vi} đang thấp nhất` : "Chưa đủ trụ để chỉ điểm nghẽn"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {verdict.weakest
              ? `${verdict.weakest.vi} ở ${verdict.weakest.score}. Trung bình nhân OGS là ${verdict.ogsLabel}. Một trụ cao không che được trụ thấp.`
              : "Cần ít nhất hai trụ vận hành đủ điều kiện để công bố OGS."}
          </p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">Green Perception Gap</p>
          <h2 className="mt-2 text-base font-semibold">
            {verdict.gapOfficial ? `${verdict.gapBand} · ${verdict.gap}` : "Chưa công bố chính thức"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Green Score {verdict.greenScore ?? "—"}, nhận thức {verdict.perception} trên {verdict.reviewCount} đánh giá. {verdict.gapText}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Độ tin cậy</p>
          <h2 className="mt-2 text-base font-semibold">Xác thực chiếm 45%</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Số mục externally verified: {verdict.externalCount}. Data Confidence {verdict.confidenceExact}, làm tròn {verdict.confidence}, nhãn {verdict.confidenceBand}. Thiếu minh chứng: {verdict.evidenceMissing} tiêu chí.
          </p>
        </article>
      </section>
    </div>
  );
}
