import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PLANS, type PlanId } from "@/lib/catalog";
import { useVerdict, useEcolink } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";

function Center({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <Link to="/" className="text-sm font-semibold text-emerald-800">
          ECOLINK
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("anla@ecolink.vn");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Center title="Đăng nhập" text="Phiên trình diễn, không phải lớp bảo mật. Tài khoản mẫu anla@ecolink.vn, mật khẩu ecolink.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim().toLowerCase() === "anla@ecolink.vn" && password === "ecolink") {
            sessionStorage.setItem("ecolink-session", "enterprise");
            void navigate({ to: "/tong-quan" });
            return;
          }
          setError("Sai tài khoản mẫu.");
        }}
      >
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" />
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <button type="submit" className="min-h-11 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-emerald-50">
          Vào bảng doanh nghiệp
        </button>
      </form>
      <Link to="/dang-ky" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-slate-700">
        Chưa có hồ sơ
      </Link>
    </Center>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setProfile = useEcolink((state) => state.setProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("3PL đường bộ và last-mile thương mại điện tử");
  return (
    <Center title="Đăng ký doanh nghiệp" text="Tạo hồ sơ thí điểm trên trình duyệt này. Không mở tài khoản máy chủ.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !email.trim()) return;
          setProfile({ name: name.trim(), email: email.trim(), segment, updated: "hồ sơ vừa tạo" });
          sessionStorage.setItem("ecolink-session", "enterprise");
          void navigate({ to: "/goi-dich-vu" });
        }}
      >
        <Field label="Tên doanh nghiệp" value={name} onChange={setName} type="text" />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <label className="block text-sm text-slate-600">
          Nhóm hoạt động
          <select value={segment} onChange={(event) => setSegment(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900">
            <option>3PL đường bộ và last-mile thương mại điện tử</option>
            <option>Kho bãi và depot container</option>
            <option>Chủ hàng thương mại điện tử</option>
          </select>
        </label>
        <button type="submit" className="min-h-11 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-emerald-50">
          Tạo hồ sơ
        </button>
      </form>
    </Center>
  );
}

export function PlanPage() {
  const plan = useEcolink((state) => state.plan);
  const setPlan = useEcolink((state) => state.setPlan);
  const profile = useEcolink((state) => state.profile);
  const setProfile = useEcolink((state) => state.setProfile);
  const verdict = useVerdict();
  return (
    <EnterpriseShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Freemium</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Hồ sơ và gói dịch vụ</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Đổi gói không đổi Green Score, Data Confidence, Coverage, nhận thức hay Gap. Điểm hiện tại là {verdict.greenScore ?? "—"}. Chọn gói khác và xem điểm trên thanh trạng thái không đổi.
          </p>
        </header>
        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setProfile({
              name: String(data.get("name") || profile.name),
              email: String(data.get("email") || profile.email),
              segment: String(data.get("segment") || profile.segment),
            });
          }}
        >
          <label className="text-sm text-slate-600">
            Tên
            <input name="name" defaultValue={profile.name} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="text-sm text-slate-600">
            Email
            <input name="email" defaultValue={profile.email} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="text-sm text-slate-600 sm:col-span-2">
            Nhóm hoạt động
            <input name="segment" defaultValue={profile.segment} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <button type="submit" className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold sm:col-span-2">
            Lưu hồ sơ
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {PLANS.map((item) => (
            <article key={item.id} className={cn("rounded-2xl border bg-white p-5", plan === item.id ? "border-emerald-600" : "border-slate-200")}>
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.price}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button type="button" onClick={() => setPlan(item.id as PlanId)} className="mt-4 min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-slate-50">
                {plan === item.id ? "Đang dùng" : "Chọn gói"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </EnterpriseShell>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (value: string) => void; type: string }) {
  return (
    <label className="block text-sm text-slate-600">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900" />
    </label>
  );
}
