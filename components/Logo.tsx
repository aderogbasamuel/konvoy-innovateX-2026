import Image from "next/image";

type Variant = "wordmark" | "mark" | "full";
type Tone = "dark" | "light";

// Files live in public/brand. Sizes are the real pixel sizes so the browser can reserve space.
const ASSETS = {
  wordmark: {
    dark: { src: "/brand/logo-wordmark.png", width: 1200, height: 158 },
    light: { src: "/brand/logo-wordmark-white.png", width: 1200, height: 158 },
  },
  mark: { src: "/brand/logo-mark.png", width: 1200, height: 614 },
  full: { src: "/brand/logo-full.png", width: 1600, height: 1042 },
} as const;

const SIZE: Record<Variant, string> = {
  wordmark: "h-7 w-auto",
  mark: "h-12 w-auto",
  full: "h-auto w-64 max-w-full",
};

interface LogoProps {
  /** wordmark: KONVOY text (default). mark: the bus alone. full: bus, wordmark and tagline. */
  variant?: Variant;
  /** dark for light backgrounds (default), light for dark green backgrounds. Only affects the wordmark. */
  tone?: Tone;
  className?: string;
  priority?: boolean;
}

export default function Logo({ variant = "wordmark", tone = "dark", className = "", priority = false }: LogoProps) {
  const asset = variant === "wordmark" ? ASSETS.wordmark[tone] : ASSETS[variant];
  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt="Konvoy"
      priority={priority}
      className={`${SIZE[variant]} ${className}`}
    />
  );
}
