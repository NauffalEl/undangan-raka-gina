import { Reveal } from "./ui";
import { Ornamen3D } from "./icons";
import { cn } from "@/lib/utils";

type Milestone = { tanggal: string; judul: string; deskripsi: string };

/** Love Story — timeline vertikal + node emas shimmer. Render hanya kalau data ada. */
export function LoveStory({ item }: { item?: Milestone[] }) {
  if (!item || item.length === 0) return null;

  return (
    <section id="love-story" aria-labelledby="love-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem] md:max-w-[42rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen3D />
        </div>
        <h2
          id="love-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Love Story
        </h2>

        <ol className="relative mt-10 space-y-10 pl-8 md:pl-0">
          {/* Garis timeline tumbuh dari atas ke bawah saat masuk viewport */}
          <span
            aria-hidden
            className="timeline-grow absolute inset-y-0 left-0 w-px bg-[linear-gradient(to_bottom,var(--color-accent-line),var(--color-gold-hi),transparent)] md:left-1/2 md:-translate-x-1/2"
          />
          {item.map((m, i) => (
            <li key={m.judul} className="relative">
              <span
                aria-hidden
                className="node-pulse gold-shimmer-bar absolute -left-[calc(2rem+0.375rem)] top-1.5 h-3 w-3 rounded-full border-2 border-bg md:left-1/2 md:-translate-x-1/2"
                style={{ animationDelay: `${i * 150}ms` }}
              />
              <Reveal delay={i * 70}>
                <article
                  className={cn(
                    "rounded-lg border border-line bg-surface p-5 shadow-[var(--inset-hairline),var(--shadow-sm)]",
                    "md:w-[calc(50%-1.5rem)]",
                    i % 2 === 1 && "md:ml-auto",
                  )}
                >
                  <span className="text-eyebrow font-semibold text-accent-deep uppercase">
                    {m.tanggal}
                  </span>
                  <h3 className="mt-1 font-display text-display-md text-ink">
                    {m.judul}
                  </h3>
                  <p className="mt-2 text-body text-ink-soft">{m.deskripsi}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}