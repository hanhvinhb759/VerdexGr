import { PRODUCT_LINES } from "@/lib/catalog";
import { perceptionState } from "@/lib/perception";
import { gapBand, round0 } from "@/lib/scoring";
import { useVerdict, useVerdex } from "@/lib/store";

export function ProductPage() {
  const products = useVerdex((state) => state.products);
  const verdict = useVerdict();
  const canCompare = verdict.coverageKind !== "insufficient" && verdict.confidence >= 50 && verdict.greenScore !== null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">Feedback Intelligence</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Nhận thức theo nhóm hàng</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Trang này tổng hợp cảm nhận của khách hàng về đóng gói, vận chuyển, thu hồi và minh bạch của từng nhóm hàng. Số liệu không phải Green Score cấp sản phẩm, không vào OGS hay TGS, và không đổi theo gói dịch vụ.
        </p>
      </header>
      <div className="grid gap-3">
        {PRODUCT_LINES.map((line) => {
          const sense = products.find((item) => item.id === line.id);
          const count = sense?.count ?? 0;
          const sample = perceptionState(count);
          const showScore = count >= 20 && sense;
          const showAspects = count >= 20 && sense;
          const low = showAspects
            ? sense.aspects.filter((aspect) => aspect.id !== "all" && aspect.count > 0 && aspect.total / aspect.count <= 3)
            : [];
          let gapText = "Chưa đủ mẫu để công bố nhận thức nhóm hàng.";
          if (count >= 20 && count < 50) gapText = "Nhận thức ở mức tham khảo. Chưa đối chiếu chính thức với Green Score doanh nghiệp.";
          else if (count >= 50 && sense && canCompare && verdict.greenScore !== null) {
            const gap = verdict.greenScore - round0(sense.score);
            gapText = `Green Score doanh nghiệp lệch ${gap} điểm so với nhận thức nhóm hàng (${gapBand(Math.abs(gap))}). Đây là tín hiệu chẩn đoán, không phải điểm xanh của SKU.`;
          } else if (count >= 50) gapText = "Mẫu đã đủ, nhưng Green Score doanh nghiệp hoặc độ tin cậy chưa đủ điều kiện để đối chiếu.";
          return (
            <article key={line.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{line.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{line.note}</p>
                </div>
                <p className="text-3xl font-semibold tabular-nums">{showScore && sense ? round0(sense.score) : "—"}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {count} đánh giá · {sample.label}. {gapText}
              </p>
              {showAspects && sense ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {sense.aspects.map((aspect) => {
                    const mean = aspect.count === 0 ? 0 : aspect.total / aspect.count;
                    return (
                      <li key={aspect.id} className="text-sm">
                        <div className="flex justify-between">
                          <span>{aspect.label}</span>
                          <span className="tabular-nums">{mean.toFixed(1)} / 5</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(mean / 5) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Chưa tách khía cạnh thành kết luận.</p>
              )}
              {low.length > 0 ? (
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  Ưu tiên kiểm tra trải nghiệm: {low.map((aspect) => aspect.label.toLowerCase()).join(", ")}. Khuyến nghị này không tự nâng điểm.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
