export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="34" height="38" viewBox="0 0 34 38" aria-hidden="true">
        <path d="M17 1 31 6v13c0 9-6 15-14 18C9 34 3 28 3 19V6z" fill="#2f6b4f" />
        <path d="M21 10c-5-1-9 0-9 3.5s9 3 9 8-5 4.5-9 3" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M23 14l4-3" stroke="#bfe0cb" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[#10201A]">
        Konvoy
      </span>
    </div>
  );
}