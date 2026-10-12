import { Reveal } from "./ui";

/** Salam pembuka — teks dari undangan.json.salam. */
export function Salam({ teks }: { teks?: string }) {
  const isi =
    teks && teks.trim()
      ? teks.trim()
      : "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nDengan memohon ridho Allah SWT, kami bermaksud mengajak Bapak/Ibu/Saudara/i untuk hadir memberikan doa restu pada hari bahagia kami.";

  const [salam, ...paragraf] = isi.split(/\n{2,}/);

  return (
    <section id="salam" aria-labelledby="salam-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem] text-center">
        <p
          id="salam-judul"
          className="font-display text-display-md italic text-accent-deep"
        >
          {salam}
        </p>
        <div className="mt-4 space-y-3 text-body-lg text-ink">
          {(paragraf.length ? paragraf : [salam]).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
