import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Leaf,
  LayoutDashboard,
  Menu,
  Package,
  Truck,
  Recycle,
  Megaphone,
  TableProperties,
  Stethoscope,
  Lightbulb,
  Scale,
  RefreshCw,
  CreditCard,
  X,
} from "lucide-react";
import { PLANS } from "@/lib/catalog";
import { useVerdict, useEcolink } from "@/lib/store";
import { cn } from "@/lib/utils";

const groups: { title: string; items: { label: string; to: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: "Vận hành",
    items: [
      { label: "Tổng quan", to: "/tong-quan", icon: LayoutDashboard },
      { label: "Nhập liệu và minh chứng", to: "/nhap-lieu", icon: Package },
      { label: "Ba trụ vận hành", to: "/tru-van-hanh", icon: Truck },
      { label: "Minh bạch truyền thông", to: "/minh-bach", icon: Megaphone },
      { label: "Ma trận điểm số", to: "/ma-tran", icon: TableProperties },
    ],
  },
  {
    title: "Vòng cải thiện",
    items: [
      { label: "Chẩn đoán", to: "/chan-doan", icon: Stethoscope },
      { label: "Khuyến nghị", to: "/khuyen-nghi", icon: Lightbulb },
      { label: "Khoảng cách nhận thức", to: "/khoang-cach", icon: Scale },
      { label: "Đánh giá lại", to: "/danh-gia-lai", icon: RefreshCw },
    ],
  },
  {
    title: "Thiết lập",
    items: [{ label: "Hồ sơ và gói dịch vụ", to: "/goi-dich-vu", icon: CreditCard }],
  },
];

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4" aria-label="Phân hệ doanh nghiệp">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{group.title}</p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm",
                      active ? "bg-emerald-50 font-semibold text-emerald-800" : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link to="/" onClick={onNavigate} className="px-3 text-sm font-medium text-slate-500">
        Về cổng công khai
      </Link>
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/tong-quan" className="flex items-center gap-3 px-5 pt-5 pb-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-700 text-emerald-50">
        <Leaf className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-semibold tracking-tight text-slate-900">ECOLINK</span>
        <span className="block text-xs text-slate-500">Green Score logistics</span>
      </span>
    </Link>
  );
}

function IntegrityPills() {
  const verdict = useVerdict();
  const pills = [
    { label: "Green Score", value: verdict.greenScore === null ? "—" : String(verdict.greenScore) },
    { label: "Coverage", value: verdict.coverageDetail.split(" ")[0] ?? "—" },
    { label: "Confidence", value: String(verdict.confidence) },
  ];
  return (
    <ul className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <li key={pill.label} className="flex items-baseline gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-500">{pill.label}</span>
          <span className="text-sm font-semibold text-slate-900 tabular-nums">{pill.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function EnterpriseShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const profile = useEcolink((state) => state.profile);
  const plan = useEcolink((state) => state.plan);
  const planName = PLANS.find((item) => item.id === plan)?.name ?? plan;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {profile.code} · {planName}
          </p>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Đóng menu" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-start justify-between pr-3">
              <Brand />
              <button type="button" className="mt-5 flex size-11 items-center justify-center rounded-xl text-slate-700" onClick={() => setOpen(false)} aria-label="Đóng menu">
                <X className="size-5" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 lg:hidden"
                aria-expanded={open}
                aria-label="Mở menu"
                onClick={() => setOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{profile.name}</p>
                <p className="truncate text-xs text-slate-500">{profile.segment}</p>
              </div>
            </div>
            <IntegrityPills />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function iconForPillar(id: string) {
  if (id === "P") return Package;
  if (id === "T") return Truck;
  if (id === "R") return Recycle;
  return Megaphone;
}
