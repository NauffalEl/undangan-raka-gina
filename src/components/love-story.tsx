import { Reveal } from "./ui";
import { Ornamen } from "./icons";
import { cn } from "@/lib/utils";

type Milestone = { tanggal: string; judul: string; deskripsi: string };

/** Love Story — timeline vertikal. Render hanya kalau data ada (spec §7). */
export function LoveStory({ item }: { item?: Milestone[] }) {
  if (!item || item.length === 0) return null;

  return (
    <section id="love-story" aria-labelledby="love-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem] md:max-w-[42rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen />
        </div>
        <h2
          id="love-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Love Story
        </h2>

        <ol className="relative mt-10 space-y-10 border-l border-sage-300 pl-8 md:border-l-0 md:pl-0">
          {item.map((m, i) => (
            <li key={m.judul} className="relative">
              <span
                aria-hidden
                className="absolute -left-[calc(2rem+0.375rem)] top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-accent md:left-1/2 md:-translate-x-1/2"
              />
              <article className={cn(
                  "rounded-lg border border-line bg-surface p-5 shadow-[var(--inset-hairline),var(--shadow-sm)]",
                  "md:w-[calc(50%-1.5rem)]",
                  i % 2 === 1 && "md:ml-auto",
                )}>
                <span className="text-eyebrow font-semibold text-accent-deep uppercase">
                  {m.tanggal}
                </span>
                <h3 className="mt-1 font-display text-display-md text-ink">
                  {m.judul}
                </h3>
                <p className="mt-2 text-body text-ink-soft">{m.deskripsi}</p>
              </article>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
