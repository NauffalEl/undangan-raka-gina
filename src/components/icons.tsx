import type { SVGProps } from "react";

type I = SVGProps<SVGSVGElement>;

function Svg({ children, className = "h-5 w-5", ...rest }: I & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...rest}>
      {children}
    </svg>
  );
}

export function Musik(props: I) {
  return (
    <Svg {...props}>
      <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
    </Svg>
  );
}

export function Sunyi(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.7-2.7-1.4-1.4-3.4 3.4-3.4-3.4-1.4 1.4L12.4 12l-2.7 2.7 1.4 1.4 3.4-3.4 3.4 3.4 1.4-1.4L14.6 12z"
      />
    </Svg>
  );
}

export function Salin(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </g>
    </Svg>
  );
}

export function Centang(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 13 4 4L19 7"
      />
    </Svg>
  );
}

export function Silang(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </Svg>
  );
}

export function PanahKiri(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5l-7 7 7 7"
      />
    </Svg>
  );
}

export function PanahKanan(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </Svg>
  );
}

export function PanahBawah(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v14m0 0-6-6m6 6 6-6"
      />
    </Svg>
  );
}

export function Pin(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </g>
    </Svg>
  );
}

export function Kalender(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </g>
    </Svg>
  );
}

export function Instagram(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
      </g>
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </Svg>
  );
}

export function WhatsApp(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.93L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm5.76 14.03c-.24.68-1.42 1.3-1.96 1.34-.5.05-.98.23-3.3-.69-2.78-1.1-4.54-3.94-4.68-4.13-.13-.19-1.11-1.48-1.11-2.82 0-1.35.7-2.01.95-2.28.25-.27.54-.34.72-.34.18 0 .36 0 .52.01.17.01.4-.07.62.48.24.58.81 1.98.88 2.12.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.15.26.1 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.7-.17 1.38Z"
      />
    </Svg>
  );
}

export function Hati(props: I) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M12 20.7 4.3 13.3a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 6.5Z"
      />
    </Svg>
  );
}

export function Orang(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
      </g>
    </Svg>
  );
}

export function Plus(props: I) {
  return (
    <Svg {...props}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function Minus(props: I) {
  return (
    <Svg {...props}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 12h14" />
    </Svg>
  );
}

export function Info(props: I) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
      </g>
    </Svg>
  );
}

export function Bulat({ className = "h-3 w-3", ...rest }: I) {
  return <Svg className={className} {...rest}><circle cx="12" cy="12" r="6" fill="currentColor" /></Svg>;
}

/** Divider ornamen antar section (design-system §6.5). */
export function Ornamen(props: I) {
  return (
    <svg
      viewBox="0 0 120 24"
      className="h-6 w-28 shrink-0 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path d="M0 12h38M82 12h38" />
      <path d="M60 4c4 4 4 12 0 16-4-4-4-12 0-16z" />
      <circle cx="48" cy="12" r="2" />
      <circle cx="72" cy="12" r="2" />
    </svg>
  );
}
