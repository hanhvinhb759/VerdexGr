import { useState } from "react";
import { useVerdict, useEcolink } from "@/lib/store";
import { cn } from "@/lib/utils";

function Head({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">{kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </header>
  );
}

export function DiagnosisPage() {
  const verdict = useVerdict();
  const low = verdict.rows.filter((row) => row.status === "implemented" && row.score < 70).sort((a, b) => a.score - b.score);
  const flags = verdict.rows.filter((row) => row.status !== "na" && (!row.evidence || row.clash || row.verify === "self"));
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Vai trò chẩn đoán"
        title="Chẩn đoán theo luật"
        text="Bốn vai trò là Assessment, Diagnosis, Recommendation và Feedback Intelligence. Phần này không gọi mô hình ngôn ngữ và không kết luận greenwashing."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Assessment", `OGS ${verdict.ogsLabel}. Coverage ${verdict.coverageLabel}.`],
          ["Diagnosis", verdict.weakest ? `${verdict.weakest.vi} là trụ vận hành thấp nhất.` : "Chưa đủ trụ để chỉ nguyên nhân."],
          ["Recommendation", "Khuyến nghị lấy từ thư viện gắn với tiêu chí dưới 70 điểm."],
          ["Feedback Intelligence", verdict.gapText],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <h2 className="text-sm font-semibold text-indigo-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-indigo-950">{text}</p>
          </article>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Tiêu chí kéo điểm xuống</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {low.length === 0 ? <li>Không có tiêu chí Implemented dưới 70.</li> : null}
          {low.map((row) => (
            <li key={row.id} className="flex justify-between gap-3 border-b border-slate-100 py-2">
              <span>{row.name}</span>
              <span className="font-semibold tabular-nums">{row.score}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Cờ dữ liệu</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {flags.length === 0 ? <li>Không có cờ thiếu minh chứng, lệch nguồn hoặc tự khai đơn thuần.</li> : null}
          {flags.map((row) => (
            <li key={row.id}>
              {row.name}: {!row.evidence ? "thiếu minh chứng. " : ""}
              {row.clash ? "lệch nguồn. " : ""}
              {row.verify === "self" ? "chỉ self-reported." : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function RecommendPage() {
  const verdict = useVerdict();
  const done = useEcolink((state) => state.done);
  const toggleDone = useEcolink((state) => state.toggleDone);
  const queue = verdict.rows.filter((row) => row.status === "implemented" && (row.score < 70 || !row.evidence || row.clash));
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Vai trò khuyến nghị"
        title="Kế hoạch hành động"
        text="Mỗi khuyến nghị gắn với một tiêu chí. Đánh dấu đã làm chỉ để theo dõi. Điểm chỉ đổi khi dữ liệu ở trang nhập liệu đổi."
      />
      <div className="grid gap-3">
        {queue.length === 0 ? <p className="text-sm text-slate-600">Không còn tiêu chí dưới ngưỡng 70 hoặc thiếu minh chứng.</p> : null}
        {queue.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-base font-semibold">{row.name}</h2>
              <span className="text-sm font-semibold tabular-nums">{row.score}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{row.action}</p>
            <button
              type="button"
              onClick={() => toggleDone(row.id)}
              className={cn(
                "mt-3 min-h-11 rounded-xl px-4 text-sm font-semibold",
                done[row.id] ? "bg-emerald-50 text-emerald-800" : "bg-indigo-600 text-indigo-50",
              )}
            >
              {done[row.id] ? "Đã ghi vào checklist" : "Ghi vào checklist"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function GapPage() {
  const verdict = useVerdict();
  const themes = useEcolink((state) => state.perception.themes);
  const max = Math.max(...themes.map((theme) => theme.count), 1);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Feedback Intelligence"
        title="Khoảng cách nhận thức"
        text="Phản hồi khách hàng không được tự trừ Green Score. Gap chính thức cần từ 50 đánh giá, coverage không ở mức không đủ phạm vi, và Data Confidence từ 50."
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <Card label="Green Score" value={verdict.greenScore ?? "—"} />
        <Card label="Customer perception" value={verdict.perception} />
        <Card label="Gap" value={verdict.gapOfficial ? String(verdict.gap) : "Chưa đủ"} />
      </section>
      <p className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700">{verdict.gapText}</p>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Chủ đề được nhắc</h2>
        <ul className="mt-4 space-y-3">
          {themes.map((theme) => (
            <li key={theme.id}>
              <div className="flex justify-between text-sm">
                <span>{theme.label}</span>
                <span className="tabular-nums">{theme.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${(theme.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ReassessPage() {
  const verdict = useVerdict();
  const history = useEcolink((state) => state.history);
  const commit = useEcolink((state) => state.commitPeriod);
  const reset = useEcolink((state) => state.reset);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Head
        kicker="Vòng khép"
        title="Đánh giá lại và tiến độ"
        text="Chốt kỳ lưu Green Score hiện tại vào diễn biến. Đặt lại hồ sơ mẫu đưa dữ liệu về trạng thái ban đầu của phiên trình diễn."
      />
      <form
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (verdict.greenScore === null) {
            setNote("Chưa đủ phạm vi để chốt kỳ.");
            return;
          }
          commit(label);
          setLabel("");
          setNote(`Đã lưu ${verdict.greenScore} điểm.`);
        }}
      >
        <label className="flex-1 text-sm text-slate-600">
          Tên kỳ
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Ví dụ T10"
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900"
          />
        </label>
        <button type="submit" className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50">
          Chốt kỳ này
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setNote("Đã trở lại hồ sơ mẫu.");
          }}
          className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"
        >
          Đặt lại hồ sơ mẫu
        </button>
      </form>
      {note ? <p className="text-sm text-slate-600">{note}</p> : null}
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {history.map((point) => (
          <li key={`${point.period}-${point.score}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{point.period}</p>
            <p className="text-2xl font-semibold tabular-nums">{point.score}</p>
          </li>
        ))}
        <li className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs text-emerald-800">Hiện tại</p>
          <p className="text-2xl font-semibold tabular-nums">{verdict.greenScore ?? "—"}</p>
        </li>
      </ol>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </article>
  );
}
