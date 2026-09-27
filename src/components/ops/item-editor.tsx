import type { Criterion, ItemStatus, VerifyLevel } from "@/lib/catalog";
import { useVerdex } from "@/lib/store";

const STATUSES: { id: ItemStatus; label: string }[] = [
  { id: "implemented", label: "Implemented" },
  { id: "not_implemented", label: "Not Implemented" },
  { id: "na", label: "Not Applicable" },
  { id: "insufficient", label: "Insufficient Data" },
];

const LEVELS: { id: VerifyLevel; label: string }[] = [
  { id: "self", label: "Self-reported · 30" },
  { id: "evidence", label: "Evidence-supported · 60" },
  { id: "cross", label: "Cross-checked · 80" },
  { id: "external", label: "Externally verified · 100" },
];

export function ItemEditor({ item }: { item: Criterion }) {
  const state = useVerdex((store) => store.items[item.id]);
  const setItem = useVerdex((store) => store.setItem);
  if (!state) return null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{item.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{item.pillar}</p>
        </div>
        <label className="text-xs text-slate-500">
          Điểm thực hành
          <input
            type="number"
            min={0}
            max={100}
            value={state.score}
            onChange={(event) => setItem(item.id, { score: clamp(Number(event.target.value)) })}
            className="mt-1 block w-24 min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-900"
          />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Trạng thái
          <select
            value={state.status}
            onChange={(event) => setItem(item.id, { status: event.target.value as ItemStatus })}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Mức xác thực
          <select
            value={state.verify}
            onChange={(event) => setItem(item.id, { verify: event.target.value as VerifyLevel })}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Số ngày từ lần cập nhật
          <input
            type="number"
            min={0}
            value={state.days}
            onChange={(event) => setItem(item.id, { days: Math.max(0, Number(event.target.value) || 0) })}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900"
          />
        </label>
        <div className="flex flex-col justify-end gap-2 text-sm text-slate-700">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={state.evidence} onChange={(event) => setItem(item.id, { evidence: event.target.checked })} />
            Có minh chứng phù hợp
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={state.clash} onChange={(event) => setItem(item.id, { clash: event.target.checked })} />
            Lệch giữa các nguồn
          </label>
        </div>
      </div>
    </article>
  );
}

function clamp(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
