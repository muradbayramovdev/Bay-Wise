import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">F</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">BayWise</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login"
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2 transition-colors">
            Giriş Yap
          </Link>
          <Link href="/auth/register"
            className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
            Başla
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-12 pb-10 max-w-xl mx-auto w-full">

        <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-100 dark:border-green-900">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Ücretsiz · Hemen kullan
        </div>

        <h1 className="text-[2.6rem] sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight mb-4">
          Paranı anla,<br />
          <span className="text-indigo-600">geleceğini planla.</span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-sm mb-8">
          Gelir ve giderlerini kolayca takip et. Bütçe hedefleri belirle, aylık trendleri gör. Sade, hızlı, etkili.
        </p>

        <Link href="/auth/register"
          className="w-full sm:w-auto bg-indigo-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
          Ücretsiz Hesap Oluştur →
        </Link>

        <p className="text-xs text-slate-400 mt-3">Kredi kartı gerekmez · 30 saniyede kurulum</p>
      </section>

      {/* App preview card */}
      <section className="px-5 max-w-sm mx-auto w-full mb-12">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl shadow-slate-100 dark:shadow-slate-900">
          {/* Mini dashboard mockup */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Nisan 2025</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100">Aylık Özet</p>
            </div>
            <span className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center text-sm">📊</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Gelir", value: "₺12.500", color: "text-green-600" },
              { label: "Gider", value: "₺8.340", color: "text-red-500" },
              { label: "Net", value: "₺4.160", color: "text-indigo-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center">
                <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-14 mb-3">
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-sm" style={{ height: `${h * 0.45}px` }} />
                <div className="w-full bg-red-200 dark:bg-red-900 rounded-sm" style={{ height: `${(100 - h) * 0.25}px` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-300 rounded-sm" />Gelir</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-300 rounded-sm" />Gider</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-12 max-w-xl mx-auto w-full">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-5">Neler sunuyor?</p>
        <div className="flex flex-col gap-3">
          {[
            { icon: "⚡", title: "Saniyeler içinde işlem ekle", desc: "Kategori seç, tutar gir, kaydet. Hepsi bu." },
            { icon: "🎯", title: "Bütçe hedefleri belirle", desc: "Kategoriye göre aylık limit koy, aşımda uyarı al." },
            { icon: "🔁", title: "Tekrarlayan işlemler", desc: "Kira, fatura gibi sabit giderleri otomatikleştir." },
            { icon: "📈", title: "6 aylık trend analizi", desc: "Gelir ve gider trendini grafikle takip et." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-5 pb-16 max-w-xl mx-auto w-full text-center">
        <div className="bg-indigo-600 rounded-3xl p-8">
          <p className="text-white font-bold text-xl mb-2">Hemen başla, ücretsiz.</p>
          <p className="text-indigo-200 text-sm mb-6">Finansal kontrolü bugün ele al.</p>
          <Link href="/auth/register"
            className="inline-block bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all text-sm">
            Hesap Oluştur →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 pb-8 px-5">
        © {new Date().getFullYear()} BayWise · Kişisel Finans Takibi
        <span className="mx-2">·</span>
        <Link href="/auth/login" className="hover:text-slate-600 transition-colors">Giriş Yap</Link>
      </footer>

    </main>
  );
}
