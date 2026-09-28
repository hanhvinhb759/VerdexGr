import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { PEERS } from "@/lib/catalog";
import { useVerdict, useEcolink } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-emerald-50">
              <Leaf className="size-4" aria-hidden="true" />
            </span>
            ECOLINK
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link to="/dang-nhap" className="inline-flex min-h-11 items-center px-3 text-slate-700">
              Đăng nhập
            </Link>
            <Link to="/dang-ky" className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 font-semibold text-emerald-50">
              Đăng ký doanh nghiệp
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export function HomePage() {
  const verdict = useVerdict();
  const profile = useEcolink((state) => state.profile);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const cards = useMemo(() => {
    const live = {
      code: profile.code,
      name: profile.name,
      segment: profile.segment,
      greenScore: verdict.greenScore,
      confidence: verdict.confidence,
      band: verdict.confidenceBand,
      coverage: verdict.coverageLabel,
      comparable: true,
      note: "Hồ sơ thí điểm. Điểm đổi theo dữ liệu doanh nghiệp nhập.",
      live: true,
    };
    return [live, ...PEERS.map((peer) => ({ ...peer, live: false, greenScore: peer.greenScore as number | null }))];
  }, [profile, verdict]);
  const visible = cards.filter((card) => `${card.name} ${card.code} ${card.segment}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = cards.filter((card) => picked.includes(card.code));
  const blocked = selected.length === 2 && selected.some((card) => !card.comparable || selected[0]?.segment !== selected[1]?.segment);

  function toggle(code: string) {
    setPicked((current) => {
      if (current.includes(code)) return current.filter((item) => item !== code);
      if (current.length >= 2) return [current[1], code];
      return [...current, code];
    });
  }

  return (
    <PublicFrame>
      <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Cổng công khai</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Đọc logistics xanh cùng phạm vi và độ tin cậy</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Green Score không đứng một mình. Mỗi hồ sơ hiện Assessment Coverage và Data Confidence. Quảng cáo không đổi thứ hạng.
      </p>
      <label className="mt-6 block text-sm text-slate-600">
        Tìm doanh nghiệp
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
          placeholder="Tên hoặc mã"
        />
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {visible.map((card) => (
          <article key={card.code} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{card.code}</p>
            <h2 className="mt-1 text-lg font-semibold">{card.name}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{card.segment}</p>
            <p className="mt-4 text-3xl font-semibold tabular-nums">{card.greenScore ?? "—"}</p>
            <p className="text-sm text-slate-600">
              {card.band} · {card.confidence}
            </p>
            <p className="mt-1 text-xs text-slate-500">{card.coverage}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/doanh-nghiep/$code" params={{ code: card.code }} className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-slate-50">
                Xem hồ sơ
              </Link>
              <button type="button" onClick={() => toggle(card.code)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm">
                {picked.includes(card.code) ? "Bỏ so sánh" : "So sánh"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected.length === 2 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">So sánh hai hồ sơ</h2>
          {blocked ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">Hai hồ sơ khác nhóm hoạt động hoặc chưa cùng điều kiện so sánh. Hệ thống không xếp bên cạnh hai Green Score này.</p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {selected.map((card) => (
                <li key={card.code} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{card.name}</p>
                  <p className="mt-1 tabular-nums">Green Score {card.greenScore ?? "—"}</p>
                  <p>Data Confidence {card.confidence}</p>
                  <p>{card.coverage}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </PublicFrame>
  );
}

export function ProfilePage() {
  const { code } = useParams({ strict: false }) as { code: string };
  const verdict = useVerdict();
  const profile = useEcolink((state) => state.profile);
  const peer = PEERS.find((item) => item.code === code);
  const live = code === profile.code;
  if (!live && !peer) {
    return (
      <PublicFrame>
        <h1 className="text-2xl font-semibold">Không thấy hồ sơ</h1>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
          Về danh bạ
        </Link>
      </PublicFrame>
    );
  }
  const name = live ? profile.name : peer?.name;
  const score = live ? verdict.greenScore : peer?.greenScore;
  const confidence = live ? verdict.confidence : peer?.confidence;
  const band = live ? verdict.confidenceBand : peer?.band;
  const coverage = live ? verdict.coverageLabel : peer?.coverage;
  return (
    <PublicFrame>
      <p className="text-xs text-slate-500">{code}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{live ? profile.segment : peer?.note}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Green Score" value={score ?? "—"} />
        <Stat label="Assessment Coverage" value={coverage ?? "—"} />
        <Stat label="Data Confidence" value={`${confidence ?? "—"} · ${band ?? ""}`} />
      </div>
      <p className="mt-4 text-sm text-slate-600">Kết quả phản ánh hồ sơ đã đánh giá, không phải chứng nhận doanh nghiệp xanh. Toàn văn chứng từ không được mở trên trang này.</p>
      {live ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {verdict.pillars.map((pillar) => (
            <article key={pillar.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold">{pillar.vi}</h2>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{pillar.score ?? "—"}</p>
              <p className="text-xs text-slate-500">{pillar.status}</p>
            </article>
          ))}
        </div>
      ) : null}
      <Link
        to="/khao-sat/$code"
        params={{ code }}
        className={cn("mt-6 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50")}
      >
        Gửi nhận thức
      </Link>
    </PublicFrame>
  );
}

export function SurveyPage() {
  const { code } = useParams({ strict: false }) as { code: string };
  const profile = useEcolink((state) => state.profile);
  const addReview = useEcolink((state) => state.addReview);
  const [pack, setPack] = useState(3);
  const [ship, setShip] = useState(3);
  const [back, setBack] = useState(3);
  const [clear, setClear] = useState(3);
  const [sent, setSent] = useState("");
  const live = code === profile.code;
  const peer = PEERS.find((item) => item.code === code);

  return (
    <PublicFrame>
      <h1 className="text-3xl font-semibold tracking-tight">Khảo sát nhận thức</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {live ? profile.name : peer?.name ?? "Hồ sơ"}. Thang 1 đến 5 được quy về 0–100. Một lượt không tự sửa Green Score.
      </p>
      {!live && !peer ? <p className="mt-4 text-sm">Không thấy doanh nghiệp.</p> : null}
      {live ? (
        <form
          className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const aspects = [
              { id: "pack", score: pack },
              { id: "ship", score: ship },
              { id: "back", score: back },
              { id: "clear", score: clear },
            ];
            const avg = aspects.reduce((sum, item) => sum + item.score, 0) / aspects.length;
            const hundred = ((avg - 1) / 4) * 100;
            const top = aspects.slice().sort((a, b) => b.score - a.score)[0];
            addReview(hundred, top?.id ?? "pack");
            setSent("Đã ghi một đánh giá hợp lệ vào hồ sơ thí điểm.");
          }}
        >
          <Scale label="Bao bì" value={pack} onChange={setPack} />
          <Scale label="Vận chuyển" value={ship} onChange={setShip} />
          <Scale label="Thu hồi" value={back} onChange={setBack} />
          <Scale label="Minh bạch" value={clear} onChange={setClear} />
          <button type="submit" className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50">
            Gửi đánh giá
          </button>
          {sent ? <p className="text-sm text-slate-600">{sent}</p> : null}
        </form>
      ) : peer ? (
        <p className="mt-4 text-sm text-slate-600">Hồ sơ tĩnh không nhận khảo sát. Chỉ hồ sơ thí điểm {profile.code} cập nhật nhận thức.</p>
      ) : null}
    </PublicFrame>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      {label}: {value}
      <input type="range" min={1} max={5} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 block w-full" />
    </label>
  );
}
