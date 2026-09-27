import { useState } from "react";
import { CRITERIA, PILLARS, type PillarId } from "@/lib/catalog";
import { pillarItems } from "@/lib/assess";
import { useVerdict } from "@/lib/store";
import { ItemEditor } from "@/components/ops/item-editor";
import { cn } from "@/lib/utils";

function Head({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">{kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </header>
  );
}

export function DataPage() {
  const [pillar, setPillar] = useState<PillarId | "all">("all");
  const list = CRITERIA.filter((item) => pillar === "all" || item.pillar === pillar);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Giai đoạn 2"
        title="Nhập liệu vận hành và minh chứng"
        text="Dữ liệu tự khai không được xem là đã xác thực. Đổi trạng thái, mức xác thực hoặc minh chứng sẽ tính lại Green Score, Coverage và Data Confidence trên mọi trang."
      />
      <div className="flex flex-wrap gap-2">
        <Filter active={pillar === "all"} onClick={() => setPillar("all")} label="Tất cả" />
        {PILLARS.map((item) => (
          <Filter key={item.id} active={pillar === item.id} onClick={() => setPillar(item.id)} label={item.vi} />
        ))}
      </div>
      <p className="text-sm text-slate-500">Hệ thống không đọc chứng từ thay kiểm toán. Nó chỉ ghi mức doanh nghiệp khai và đối chiếu cờ lệch nguồn.</p>
      <div className="grid gap-3">
        {list.map((item) => (
          <ItemEditor key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function PillarsPage() {
  const verdict = useVerdict();
  const [current, setCurrent] = useState<PillarId>("P");
  const currentPillar = verdict.pillars.find((item) => item.id === current);
  const currentRows = pillarItems(verdict, current);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Giai đoạn 2"
        title="Ba trụ vận hành"
        text="Điểm trụ là trung bình các tiêu chí Implemented. Not Implemented và Insufficient Data làm cả trụ không đủ điều kiện đưa vào OGS, chứ không bị tính bằng 0."
      />
      <div className="flex flex-wrap gap-2">
        {(["P", "T", "R"] as PillarId[]).map((key) => (
          <Filter key={key} active={current === key} onClick={() => setCurrent(key)} label={PILLARS.find((item) => item.id === key)?.vi ?? key} />
        ))}
      </div>
      {currentPillar ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">{currentPillar.name}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{currentPillar.score ?? "—"}</p>
          <p className="mt-2 text-sm text-slate-600">
            {currentPillar.status}
            {currentPillar.eligible ? " · đủ điều kiện vào OGS" : " · chưa vào OGS"}
          </p>
        </section>
      ) : null}
      <div className="grid gap-3">
        {currentRows.map((row) => (
          <ItemEditor key={row.id} item={row} />
        ))}
      </div>
    </div>
  );
}

export function TransparencyPage() {
  const verdict = useVerdict();
  const pillar = verdict.pillars.find((item) => item.id === "TGS");
  const rows = pillarItems(verdict, "TGS");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Giai đoạn 2"
        title="Minh bạch và truyền thông"
        text="Trụ này không ngang hàng với đóng gói, vận chuyển và logistics ngược. Nó chỉ được cộng tối đa 15% và không được kéo Green Score vượt Operational Green Score quá 10 điểm."
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Transparency and Green Communication Score</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{pillar?.score ?? "—"}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Điểm trước trần {verdict.rawScore ?? "—"}. Trần {verdict.cap ?? "—"}. Green Score công bố {verdict.greenScore ?? "—"}.
        </p>
      </section>
      <div className="grid gap-3">
        {rows.map((row) => (
          <ItemEditor key={row.id} item={row} />
        ))}
      </div>
    </div>
  );
}

export function MatrixPage() {
  const verdict = useVerdict();
  const weights = [
    ["Evidence Completeness", verdict.parts.evidence, "20%"],
    ["Source Consistency", verdict.parts.consistency, "20%"],
    ["Data Recency", verdict.parts.recency, "15%"],
    ["Validation and Verification", verdict.parts.verification, "45%"],
  ];
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Giai đoạn 2"
        title="Ma trận điểm, phạm vi và độ tin cậy"
        text="Ba con số phải được đọc cùng nhau. Green Score không phải chứng nhận xanh. Trọng số dưới đây là tham số prototype."
      />
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Trụ</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Vào OGS</th>
              <th className="px-4 py-3 font-medium">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {verdict.pillars.map((pillar) => (
              <tr key={pillar.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">{pillar.vi}</td>
                <td className="px-4 py-3">{pillar.status}</td>
                <td className="px-4 py-3">{pillar.inOgs ? (pillar.eligible ? "Có" : "Không, chưa đủ điều kiện") : "Không, trụ bổ trợ"}</td>
                <td className="px-4 py-3 tabular-nums">{pillar.score ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Green Score</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="OGS" value={verdict.ogsLabel} />
            <Row label="Trước trần" value={verdict.rawScore ?? "—"} />
            <Row label="Trần OGS + 10" value={verdict.cap ?? "—"} />
            <Row label="Công bố" value={verdict.greenScore ?? "—"} />
            <Row label="Coverage" value={verdict.coverageLabel} />
          </dl>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Data Confidence {verdict.confidence}</h2>
          <p className="mt-1 text-sm text-emerald-800">{verdict.confidenceBand}</p>
          <ul className="mt-4 space-y-3">
            {weights.map(([label, score, weight]) => (
              <li key={label} className="flex items-center justify-between gap-3 text-sm">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">
                  {score} · {weight}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Filter({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-4 text-sm font-medium",
        active ? "bg-emerald-700 text-emerald-50" : "border border-slate-200 bg-white text-slate-700",
      )}
    >
      {label}
    </button>
  );
}
