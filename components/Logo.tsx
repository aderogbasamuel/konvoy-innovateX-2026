export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="34" height="38" viewBox="0 0 34 38" aria-hidden="true">
        <path d="M17 1 31 6v13c0 9-6 15-14 18C9 34 3 28 3 19V6z" fill="#2f6b4f" />
        {/* Road: wide at the bottom, bending away to the horizon */}
        <path
          d="M11 31C11 24 16.5 22 17 17C17.4 13.5 18.3 11.5 18.6 9H21C21.2 11.5 21.6 13.5 22.2 17C23 22 25 25 25 31Z"
          fill="#fff"
        />
        {/* Centre line */}
        <path
          d="M18 30C18 25 20.2 23 20 18C19.8 15 19.8 13 19.8 11"
          fill="none"
          stroke="#2f6b4f"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="2.4 2.2"
        />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[#10201A]">
        Konvoy
      </span>
    </div>
  );
}