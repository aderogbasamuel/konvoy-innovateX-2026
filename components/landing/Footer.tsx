export default function Footer() {
  return (
    <footer className="px-5 py-8 text-[0.9rem] text-[#8FD1A9]">
      <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-x-6 gap-y-3">
        <span>Konvoy, safe rides for NYSC corpers</span>
        <span className="flex gap-6">
          <a href="#how" className="inline-block py-2">How it works</a>
          <a href="#partner" className="inline-block py-2">Partners</a>
          <a href="#" className="inline-block py-2">Privacy</a>
        </span>
      </div>
    </footer>
  );
}