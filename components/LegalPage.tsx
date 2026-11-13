import Link from "next/link";
import { TERMS_VERSION, type LegalSection } from "@/lib/terms";

// Public, read-only view of the Terms / Privacy text from lib/terms.ts.
export function LegalPage({ title, sections, other }: { title: string; sections: LegalSection[]; other: { href: string; label: string } }) {
  return (
    <div className="h-full overflow-y-auto px-4 py-8">
      <main className="pixel-border mx-auto w-full max-w-2xl bg-dv-panel2 p-5 shadow-pixel text-[#fdf3dc]">
        <span className="eyebrow">{title.toUpperCase()} · v{TERMS_VERSION}</span>
        <h1 className="mt-2 text-sm text-dv-brassLight">Dragon Valley // Attack Ledger</h1>
        <div className="mt-4 space-y-4 text-xs leading-relaxed">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-1 text-[11px] text-dv-brassLight">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mb-1">{p}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-6 flex justify-between text-[11px]">
          <Link href="/" className="text-dv-brassLight underline">Back to app</Link>
          <Link href={other.href} className="text-dv-brassLight underline">{other.label}</Link>
        </div>
      </main>
    </div>
  );
}
