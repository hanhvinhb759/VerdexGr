import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { PEERS, PRODUCT_LINES } from "@/lib/catalog";
import { findProductReview, findReview, readJournal, readProductJournal, saveProductReview, saveReview, type JournalEntry, type ProductJournalEntry } from "@/lib/customer-journal";
import { perceptionState, toHundred } from "@/lib/perception";
import { useVerdict, useVerdex } from "@/lib/store";
import { cn } from "@/lib/utils";

const ASPECTS = [
  { id: "pack", label: "Đóng gói", hint: "Bao bì có giảm vật liệu thừa và phù hợp với hàng nhận được." },
  { id: "ship", label: "Vận chuyển", hint: "Cách giao hàng có khớp với thông tin xanh đã công bố." },
  { id: "back", label: "Thu hồi", hint: "Có điểm trả hoặc cách hoàn bao bì mà người nhận làm được." },
  { id: "clear", label: "Minh bạch", hint: "Thông tin xanh có dễ hiểu và có tóm tắt minh chứng." },
  { id: "all", label: "Cảm nhận tổng thể", hint: "Mức độ doanh nghiệp đang thực hiện logistics xanh." },
] as const;

const SEGMENTS = [
  "Tất cả nhóm",
  "3PL đường bộ và last-mile thương mại điện tử",
  "Kho bãi và depot container",
  "Chủ hàng thương mại điện tử",
];

type FocusId = "balance" | "pack" | "ship" | "back" | "clear";

const FOCI: { id: FocusId; label: string }[] = [
  { id: "balance", label: "Cân bằng" },
  { id: "pack", label: "Đóng gói" },
  { id: "ship", label: "Vận chuyển" },
  { id: "back", label: "Thu hồi" },
  { id: "clear", label: "Minh bạch" },
];

type Firm = {
  code: string;
  name: string;
  segment: string;
  greenScore: number | null;
  confidence: number;
  band: string;
  coverage: string;
  comparable: boolean;
  note: string;
  live: boolean;
  perception: number;
  reviews: number;
  pillars: { pack: number | null; ship: number | null; back: number | null; clear: number | null };
};

export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-emerald-50">
              <Leaf className="size-4" aria-hidden="true" />
            </span>
            Verdex
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="Cổng khách hàng">
            <Nav to="/">Danh bạ</Nav>
            <Nav to="/cach-doc">Cách đọc điểm</Nav>
            <Nav to="/de-xuat">Đề xuất</Nav>
            <Nav to="/danh-gia-cua-toi">Đánh giá của tôi</Nav>
            <Link to="/dang-nhap" className="inline-flex min-h-11 items-center rounded-xl px-3 text-slate-600">
              Doanh nghiệp
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function Nav({ to, children }: { to: "/" | "/cach-doc" | "/de-xuat" | "/danh-gia-cua-toi"; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center rounded-xl px-3 text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}

function useFirms(): Firm[] {
  const verdict = useVerdict();
  const profile = useVerdex((state) => state.profile);
  const perception = useVerdex((state) => state.perception);
  return useMemo(() => {
    const pillar = (id: string) => verdict.pillars.find((item) => item.id === id)?.score ?? null;
    const live: Firm = {
      code: profile.code,
      name: profile.name,
      segment: profile.segment,
      greenScore: verdict.greenScore,
      confidence: verdict.confidence,
      band: verdict.confidenceBand,
      coverage: verdict.coverageLabel,
      comparable: verdict.coverageKind !== "insufficient" && verdict.confidence >= 50,
      note: "Hồ sơ thí điểm. Điểm đổi theo dữ liệu doanh nghiệp nhập trong phiên này.",
      live: true,
      perception: verdict.perception,
      reviews: perception.count,
      pillars: { pack: pillar("P"), ship: pillar("T"), back: pillar("R"), clear: pillar("TGS") },
    };
    return [live, ...PEERS.map((peer) => ({ ...peer, live: false }))];
  }, [profile, verdict, perception.count]);
}

export function HomePage() {
  const firms = useFirms();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const visible = firms.filter((firm) => {
    const blob = `${firm.name} ${firm.code} ${firm.segment}`.toLowerCase();
    const matchQuery = blob.includes(query.trim().toLowerCase());
    const matchSegment = segment === "Tất cả nhóm" || firm.segment === segment;
    return matchQuery && matchSegment;
  });
  const selected = firms.filter((firm) => picked.includes(firm.code));
  const blocked =
    selected.length === 2 && (selected.some((firm) => !firm.comparable) || selected[0]?.segment !== selected[1]?.segment);

  function toggle(code: string) {
    setPicked((current) => {
      if (current.includes(code)) return current.filter((item) => item !== code);
      if (current.length >= 2) return [current[1], code];
      return [...current, code];
    });
  }

  return (
    <PublicFrame>
      <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Cổng khách hàng</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Đọc logistics xanh cùng phạm vi và độ tin cậy</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Green Score không đứng một mình. Mỗi hồ sơ hiện Assessment Coverage và Data Confidence. Phí quảng cáo không đổi thứ hạng.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_16rem]">
        <label className="block text-sm text-slate-600">
          Tìm doanh nghiệp
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
            placeholder="Tên hoặc mã"
          />
        </label>
        <label className="block text-sm text-slate-600">
          Nhóm hoạt động
          <select
            value={segment}
            onChange={(event) => setSegment(event.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
          >
            {SEGMENTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {visible.length === 0 ? <p className="mt-6 text-sm text-slate-600">Không có doanh nghiệp khớp bộ lọc.</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {visible.map((firm) => (
          <article key={firm.code} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{firm.code}</p>
            <h2 className="mt-1 text-lg font-semibold">{firm.name}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{firm.segment}</p>
            <p className="mt-4 text-3xl font-semibold tabular-nums">{firm.greenScore ?? "—"}</p>
            <p className="text-sm text-slate-600">
              {firm.band} · {firm.confidence}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{firm.coverage}</p>
            <p className="mt-2 text-xs text-slate-500">
              Nhận thức {firm.reviews < 20 ? "chưa đủ mẫu" : firm.perception} · {perceptionState(firm.reviews).label}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/doanh-nghiep/$code"
                params={{ code: firm.code }}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-slate-50"
              >
                Xem hồ sơ
              </Link>
              <button type="button" onClick={() => toggle(firm.code)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm">
                {picked.includes(firm.code) ? "Bỏ so sánh" : "So sánh"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected.length === 2 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">So sánh hai hồ sơ</h2>
          {blocked ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hai hồ sơ khác nhóm hoạt động, hoặc một hồ sơ chưa đủ phạm vi đánh giá hay Data Confidence dưới 50. Hệ thống không xếp hai Green Score này cạnh nhau.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {selected.map((firm) => (
                <li key={firm.code} className="rounded-xl bg-slate-50 p-3 text-sm leading-6">
                  <p className="font-semibold">{firm.name}</p>
                  <p className="tabular-nums">Green Score {firm.greenScore ?? "—"}</p>
                  <p>
                    Data Confidence {firm.confidence} · {firm.band}
                  </p>
                  <p>{firm.coverage}</p>
                  <p>
                    Nhận thức {firm.reviews < 20 ? "chưa công bố" : firm.perception} · {perceptionState(firm.reviews).label}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chọn đúng hai hồ sơ cùng nhóm để so sánh. Quảng cáo không tham gia thứ tự này.</p>
      )}
    </PublicFrame>
  );
}

export function ProfilePage() {
  const { code } = useParams({ strict: false }) as { code: string };
  const firms = useFirms();
  const firm = firms.find((item) => item.code === code);
  const verdict = useVerdict();
  const history = useVerdex((state) => state.history);
  const rows = verdict.rows;
  if (!firm) {
    return (
      <PublicFrame>
        <h1 className="text-2xl font-semibold">Không thấy hồ sơ</h1>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
          Về danh bạ
        </Link>
      </PublicFrame>
    );
  }
  const sample = perceptionState(firm.reviews);
  const showPerception = firm.reviews >= 20;
  return (
    <PublicFrame>
      <Link to="/" className="text-sm font-medium text-emerald-800">
        Danh bạ
      </Link>
      <p className="mt-3 text-xs text-slate-500">{firm.code}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{firm.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{firm.live ? firm.segment : firm.note}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Green Score" value={firm.greenScore ?? "—"} hint="Điểm tổng hợp đã công bố, không phải chứng nhận xanh." />
        <Stat label="Assessment Coverage" value={firm.coverage} hint={firm.live ? verdict.coverageDetail : "Phạm vi các trụ áp dụng đã được đánh giá."} />
        <Stat label="Data Confidence" value={`${firm.confidence} · ${firm.band}`} hint="Mức đầy đủ và đối chiếu của dữ liệu phía sau điểm." />
      </div>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Các hoạt động logistics xanh</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["pack", "Đóng gói xanh"],
              ["ship", "Vận chuyển xanh"],
              ["back", "Logistics ngược"],
              ["clear", "Minh bạch truyền thông"],
            ] as const
          ).map(([key, label]) => (
            <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">{label}</h3>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{firm.pillars[key] ?? "—"}</p>
              <p className="text-xs text-slate-500">{firm.pillars[key] === null ? "Chưa đủ dữ liệu để đưa vào điểm." : "Điểm công khai của trụ này."}</p>
            </article>
          ))}
        </div>
      </section>
      {firm.live ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Dữ liệu và tóm tắt minh chứng</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Trang này không mở toàn văn hóa đơn hay chứng từ. Chỉ hiện trạng thái và việc đã có tóm tắt được phép công khai hay chưa.</p>
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {rows
              .filter((row) => row.status !== "na")
              .map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span>
                    <span className="font-medium">{row.name}</span>
                    <span className="mt-1 block text-slate-500">
                      {statusLabel(row.status)} · {row.evidence ? "Đã có tóm tắt minh chứng" : "Chưa công bố minh chứng"} · cập nhật {row.days} ngày trước
                      {row.clash ? " · công bố và vận hành chưa khớp hoàn toàn" : ""}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{row.status === "implemented" ? row.score : "—"}</span>
                </li>
              ))}
          </ul>
        </section>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">{firm.note} Hồ sơ tĩnh không mở danh mục minh chứng chi tiết.</p>
      )}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Tiến trình cải thiện</h2>
        {firm.live ? (
          <ol className="mt-4 space-y-2">
            {history.map((point) => (
              <li key={point.period} className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-slate-500">{point.period}</span>
                <span className="h-1.5 rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-emerald-700" style={{ width: `${Math.max(8, Math.min(100, point.score))}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{point.score}</span>
              </li>
            ))}
            {verdict.greenScore !== null ? (
              <li className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-slate-500">Nay</span>
                <span className="h-1.5 rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-emerald-700" style={{ width: `${verdict.greenScore}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{verdict.greenScore}</span>
              </li>
            ) : null}
          </ol>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">Hồ sơ tĩnh chưa công bố chuỗi kỳ. Chỉ hồ sơ thí điểm hiện diễn biến trong phiên.</p>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Customer Green Perception Score</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {showPerception ? firm.perception : "—"} · {sample.label}. {sample.detail} Điểm này là cảm nhận của khách hàng, không thay Green Score.
        </p>
        {firm.live ? <p className="mt-3 text-sm leading-6 text-slate-700">{verdict.gapText}</p> : null}
      </section>
      {firm.live ? <ProductSenseList /> : null}
      <Link
        to="/khao-sat/$code"
        params={{ code: firm.code }}
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50"
      >
        Gửi nhận thức
      </Link>
    </PublicFrame>
  );
}

export function SurveyPage() {
  const { code } = useParams({ strict: false }) as { code: string };
  const firms = useFirms();
  const firm = firms.find((item) => item.code === code);
  const addReview = useVerdex((state) => state.addReview);
  const [scores, setScores] = useState<Record<string, number | null>>({ pack: null, ship: null, back: null, clear: null, all: null });
  const [comment, setComment] = useState("");
  const [prior, setPrior] = useState<JournalEntry | null>(null);
  const [checked, setChecked] = useState(false);
  const [sent, setSent] = useState("");

  useEffect(() => {
    setPrior(findReview(code));
    setChecked(true);
    setSent("");
  }, [code]);

  if (!firm) {
    return (
      <PublicFrame>
        <h1 className="text-2xl font-semibold">Không thấy doanh nghiệp</h1>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
          Về danh bạ
        </Link>
      </PublicFrame>
    );
  }

  const ready = ASPECTS.every((aspect) => scores[aspect.id] !== null);
  const locked = Boolean(prior);

  return (
    <PublicFrame>
      <p className="text-xs text-slate-500">{firm.code}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nhận thức về {firm.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Thang 1 đến 5 được quy về 0–100. Một lượt trên trình duyệt này không tự sửa Green Score. Bình luận chỉ lưu trong đánh giá của bạn, không hiện công khai.
      </p>
      {!checked ? <p className="mt-6 text-sm text-slate-500">Đang mở phiếu.</p> : null}
      {checked && locked && prior ? (
        <article className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6">
          <p className="font-semibold">Bạn đã gửi một đánh giá cho hồ sơ này.</p>
          <p className="mt-2 text-slate-600">
            Điểm nhận thức đã quy đổi: {Math.round(prior.hundred)}. {prior.ledger ? "Lượt này đã vào sổ nhận thức của hồ sơ thí điểm." : "Hồ sơ tĩnh không cập nhật sổ điểm thí điểm."}
          </p>
          <Link to="/danh-gia-cua-toi" className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800">
            Xem đánh giá của tôi
          </Link>
        </article>
      ) : null}
      {checked && !locked ? (
        <form
          className="mt-6 max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ready || findReview(firm.code)) return;
            const values = ASPECTS.map((aspect) => scores[aspect.id] as number);
            const hundred = toHundred(values);
            const concern = ASPECTS.filter((aspect) => aspect.id !== "all").slice().sort(
              (left, right) => (scores[left.id] as number) - (scores[right.id] as number),
            )[0];
            const entry: JournalEntry = {
              code: firm.code,
              name: firm.name,
              at: new Date().toISOString(),
              scores: Object.fromEntries(ASPECTS.map((aspect) => [aspect.id, scores[aspect.id] as number])),
              hundred,
              comment: comment.trim().slice(0, 400),
              ledger: firm.live,
            };
            if (firm.live) addReview(hundred, concern?.id ?? "pack");
            saveReview(entry);
            setPrior(entry);
            setSent(firm.live ? "Đã ghi một đánh giá hợp lệ. Green Score không đổi." : "Đã lưu vào đánh giá của bạn. Hồ sơ tĩnh không vào sổ điểm thí điểm.");
          }}
        >
          {ASPECTS.map((aspect) => (
            <fieldset key={aspect.id}>
              <legend className="text-sm font-medium text-slate-800">{aspect.label}</legend>
              <p className="mt-1 text-xs leading-5 text-slate-500">{aspect.hint}</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={scores[aspect.id] === value}
                    onClick={() => setScores((current) => ({ ...current, [aspect.id]: value }))}
                    className={cn(
                      "min-h-11 rounded-xl border text-sm font-semibold tabular-nums",
                      scores[aspect.id] === value ? "border-emerald-700 bg-emerald-700 text-emerald-50" : "border-slate-200 bg-white text-slate-800",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="block text-sm text-slate-700">
            Ghi chú, không bắt buộc
            <textarea
              value={comment}
              maxLength={400}
              onChange={(event) => setComment(event.target.value)}
              className="mt-1 block min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            disabled={!ready}
            className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Gửi đánh giá
          </button>
          {sent ? <p className="text-sm text-slate-600">{sent}</p> : null}
        </form>
      ) : null}
    </PublicFrame>
  );
}

export function GuidePage() {
  const blocks = [
    ["Green Score", "Chỉ số tổng hợp về logistics xanh của doanh nghiệp, dựa trên dữ liệu, minh chứng và kết quả đối chiếu. Điểm này không phải chứng nhận doanh nghiệp xanh tuyệt đối."],
    ["Assessment Coverage", "Cho biết phần hoạt động áp dụng được đã đánh giá đến đâu. Phạm vi chưa đủ thì điểm tổng hợp không được công bố, hoặc được ghi là tạm."],
    ["Data Confidence", "Cho biết dữ liệu phía sau điểm đầy đủ, nhất quán, mới và đã đối chiếu đến mức nào. Hai doanh nghiệp cùng Green Score vẫn có thể khác độ tin cậy."],
    ["Customer Green Perception Score", "Cảm nhận của khách hàng về đóng gói, vận chuyển, thu hồi, minh bạch và tổng thể. Dưới 20 đánh giá là chưa đủ mẫu. Từ 20 đến 49 là tham khảo. Từ 50 mới dùng cho khoảng cách chính thức."],
    ["Green Perception Gap", "Chênh lệch giữa Green Score và nhận thức khách hàng. Khoảng cách lớn là tín hiệu cần kiểm tra hoặc cần công bố rõ hơn, không phải kết luận gian lận xanh."],
    ["Đề xuất và nội dung tài trợ", "Đề xuất dựa trên nhu cầu và dữ liệu công khai cùng nhóm hoạt động. Nội dung tài trợ được tách riêng và không đổi Green Score, nhận thức hay thứ hạng."],
    ["Ý định mua", "Thông tin minh bạch hỗ trợ nhận biết và cân nhắc. Nền tảng không khẳng định Green Score tự tạo ra hành vi mua."],
  ] as const;
  return (
    <PublicFrame>
      <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Cách đọc</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Đọc một hồ sơ mà không cần thuật ngữ vận hành</h1>
      <div className="mt-6 grid gap-3">
        {blocks.map(([title, text]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </PublicFrame>
  );
}

export function SuggestPage() {
  const firms = useFirms();
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [focus, setFocus] = useState<FocusId>("balance");
  const pool = firms.filter((firm) => segment === "Tất cả nhóm" || firm.segment === segment);
  const ready: { firm: Firm; signal: number }[] = [];
  const missing: Firm[] = [];
  for (const firm of pool) {
    const signal = focus === "balance" ? firm.greenScore : firm.pillars[focus];
    if (signal === null) missing.push(firm);
    else ready.push({ firm, signal });
  }
  ready.sort((left, right) => right.signal - left.signal || right.firm.confidence - left.firm.confidence);

  return (
    <PublicFrame>
      <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Đề xuất</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Chọn theo nhu cầu, không theo phí hiển thị</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Danh sách sắp theo tín hiệu công khai của ưu tiên đã chọn, rồi theo Data Confidence. Hồ sơ Provisional vẫn hiện kèm cảnh báo, không bị giấu và không bị đẩy lên vì tài trợ.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-600">
          Nhóm hoạt động
          <select value={segment} onChange={(event) => setSegment(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3">
            {SEGMENTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm text-slate-600">Ưu tiên</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {FOCI.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={focus === item.id}
                onClick={() => setFocus(item.id)}
                className={cn(
                  "min-h-11 rounded-xl px-3 text-sm",
                  focus === item.id ? "bg-emerald-700 font-semibold text-emerald-50" : "border border-slate-200 bg-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <ol className="mt-6 grid gap-3">
        {ready.map(({ firm, signal }, index) => (
          <li key={firm.code} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {index + 1} · {firm.code}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{firm.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{firm.segment}</p>
              </div>
              <p className="text-2xl font-semibold tabular-nums">{signal}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {focus === "balance" ? "Theo Green Score công bố." : "Theo trụ ưu tiên đã chọn."} Data Confidence {firm.confidence} · {firm.band}. {firm.coverage}.
              {firm.confidence < 50 ? " Độ tin cậy còn Provisional, nên đọc kèm phạm vi đánh giá." : ""}
            </p>
            <Link to="/doanh-nghiep/$code" params={{ code: firm.code }} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
              Mở hồ sơ
            </Link>
          </li>
        ))}
      </ol>
      {missing.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Chưa đủ dữ liệu cho ưu tiên này</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {missing.map((firm) => (
              <li key={firm.code}>
                {firm.name} không có điểm trụ tương ứng, nên không vào danh sách đề xuất.
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <aside className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Nội dung tài trợ</p>
        <p className="mt-2">Khu vực này tách khỏi danh sách phía trên. Phí quảng cáo và affiliate không phải biến đầu vào của Green Score, Customer Green Perception Score hay thứ tự đề xuất.</p>
      </aside>
    </PublicFrame>
  );
}

export function MyReviewsPage() {
  const [rows, setRows] = useState<JournalEntry[] | null>(null);
  const [products, setProducts] = useState<ProductJournalEntry[] | null>(null);
  useEffect(() => {
    setRows(readJournal());
    setProducts(readProductJournal());
  }, []);
  const empty = rows !== null && products !== null && rows.length === 0 && products.length === 0;
  return (
    <PublicFrame>
      <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Phiên trình duyệt này</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Đánh giá của tôi</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Mỗi doanh nghiệp và mỗi nhóm hàng một lượt. Các đánh giá không sửa Green Score. Nhận thức nhóm hàng không phải điểm xanh của sản phẩm.
      </p>
      {rows === null ? <p className="mt-6 text-sm text-slate-500">Đang mở danh sách.</p> : null}
      {empty ? <p className="mt-6 text-sm text-slate-600">Chưa có đánh giá. Hãy mở một hồ sơ và gửi nhận thức.</p> : null}
      <ul className="mt-6 grid gap-3">
        {rows?.map((row) => (
          <li key={row.code} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">{row.name}</h2>
              <span className="tabular-nums font-semibold">{Math.round(row.hundred)}</span>
            </div>
            <p className="text-slate-500">{new Date(row.at).toLocaleString("vi-VN")}</p>
            <p className="mt-2 text-slate-700">
              {ASPECTS.map((aspect) => `${aspect.label} ${row.scores[aspect.id] ?? "—"}`).join(" · ")}
            </p>
            {row.comment ? <p className="mt-2 text-slate-600">{row.comment}</p> : null}
            <p className="mt-2 text-slate-500">{row.ledger ? "Đã vào sổ nhận thức thí điểm." : "Chỉ lưu cục bộ. Không vào sổ điểm thí điểm."}</p>
            <Link to="/doanh-nghiep/$code" params={{ code: row.code }} className="mt-2 inline-flex min-h-11 items-center font-semibold text-emerald-800">
              Xem hồ sơ
            </Link>
          </li>
        ))}
        {products?.map((row) => (
          <li key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6">
            <p className="text-xs text-slate-500">Nhóm hàng</p>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">{row.name}</h2>
              <span className="tabular-nums font-semibold">{Math.round(row.hundred)}</span>
            </div>
            <p className="text-slate-500">{new Date(row.at).toLocaleString("vi-VN")}</p>
            <p className="mt-2 text-slate-700">
              {ASPECTS.map((aspect) => `${aspect.label} ${row.scores[aspect.id] ?? "—"}`).join(" · ")}
            </p>
            {row.comment ? <p className="mt-2 text-slate-600">{row.comment}</p> : null}
            <p className="mt-2 text-slate-500">Đã vào nhận thức nhóm hàng. Không vào Green Score.</p>
          </li>
        ))}
      </ul>
    </PublicFrame>
  );
}

function ProductSenseList() {
  const products = useVerdex((state) => state.products);
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Nhận thức theo nhóm hàng</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Đây là cảm nhận của khách hàng về đóng gói, vận chuyển, thu hồi và minh bạch của từng nhóm hàng. Không phải Green Score cấp sản phẩm.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {PRODUCT_LINES.map((line) => {
          const sense = products.find((item) => item.id === line.id);
          const count = sense?.count ?? 0;
          const sample = perceptionState(count);
          return (
            <li key={line.id} className="rounded-xl bg-slate-50 p-3 text-sm leading-6">
              <p className="font-semibold">{line.name}</p>
              <p className="text-slate-600">{line.note}</p>
              <p className="mt-2 tabular-nums">
                {count < 20 || !sense ? "—" : Math.round(sense.score)} · {sample.label}
              </p>
              <Link to="/nhom-hang/$id" params={{ id: line.id }} className="mt-2 inline-flex min-h-11 items-center font-semibold text-emerald-800">
                Gửi nhận thức nhóm hàng
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ProductReviewPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const line = PRODUCT_LINES.find((item) => item.id === id);
  const addProductReview = useVerdex((state) => state.addProductReview);
  const [scores, setScores] = useState<Record<string, number | null>>({ pack: null, ship: null, back: null, clear: null, all: null });
  const [comment, setComment] = useState("");
  const [prior, setPrior] = useState<ProductJournalEntry | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPrior(line ? findProductReview(line.id) : null);
    setChecked(true);
  }, [line]);

  if (!line) {
    return (
      <PublicFrame>
        <h1 className="text-2xl font-semibold">Không thấy nhóm hàng</h1>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
          Về danh bạ
        </Link>
      </PublicFrame>
    );
  }

  const ready = ASPECTS.every((aspect) => scores[aspect.id] !== null);

  return (
    <PublicFrame>
      <p className="text-xs text-slate-500">Nhóm hàng · hồ sơ thí điểm</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{line.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {line.note} Thang 1 đến 5 chỉ cập nhật nhận thức nhóm hàng. Green Score doanh nghiệp không đổi.
      </p>
      {!checked ? <p className="mt-6 text-sm text-slate-500">Đang mở phiếu.</p> : null}
      {checked && prior ? (
        <article className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6">
          <p className="font-semibold">Bạn đã gửi nhận thức cho nhóm hàng này.</p>
          <p className="mt-2 text-slate-600">Điểm đã quy đổi: {Math.round(prior.hundred)}. Lượt này không phải Green Score của sản phẩm.</p>
          <Link to="/danh-gia-cua-toi" className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800">
            Xem đánh giá của tôi
          </Link>
        </article>
      ) : null}
      {checked && !prior ? (
        <form
          className="mt-6 max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ready || findProductReview(line.id)) return;
            const values = ASPECTS.map((aspect) => scores[aspect.id] as number);
            const hundred = toHundred(values);
            const picked = Object.fromEntries(ASPECTS.map((aspect) => [aspect.id, scores[aspect.id] as number]));
            saveProductReview({
              id: line.id,
              name: line.name,
              at: new Date().toISOString(),
              scores: picked,
              hundred,
              comment: comment.trim().slice(0, 400),
            });
            addProductReview(line.id, hundred, picked);
            setPrior({ id: line.id, name: line.name, at: new Date().toISOString(), scores: picked, hundred, comment: comment.trim() });
          }}
        >
          {ASPECTS.map((aspect) => (
            <fieldset key={aspect.id}>
              <legend className="text-sm font-medium text-slate-800">{aspect.label}</legend>
              <p className="mt-1 text-xs leading-5 text-slate-500">{aspect.hint}</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={scores[aspect.id] === value}
                    onClick={() => setScores((current) => ({ ...current, [aspect.id]: value }))}
                    className={cn(
                      "min-h-11 rounded-xl border text-sm font-semibold tabular-nums",
                      scores[aspect.id] === value ? "border-emerald-700 bg-emerald-700 text-emerald-50" : "border-slate-200 bg-white text-slate-800",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="block text-sm text-slate-700">
            Ghi chú, không bắt buộc
            <textarea
              value={comment}
              maxLength={400}
              onChange={(event) => setComment(event.target.value)}
              className="mt-1 block min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            disabled={!ready}
            className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Gửi nhận thức nhóm hàng
          </button>
        </form>
      ) : null}
    </PublicFrame>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-snug">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </article>
  );
}

function statusLabel(status: string) {
  if (status === "implemented") return "Đang thực hiện";
  if (status === "not_implemented") return "Chưa triển khai";
  if (status === "insufficient") return "Chưa đủ dữ liệu";
  return "Không áp dụng";
}
