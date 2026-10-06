// Shared button styles. Save as components/ui/buttons.ts and use these everywhere.
// Add `w-full` where a button should fill its row.

const base =
  "inline-flex min-h-[52px] items-center justify-center rounded-[14px] px-6 text-base font-semibold transition-colors motion-reduce:transition-none " +
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/** The one main action on a screen. */
export const buttonPrimary = `${base} bg-[#0A3B22] text-[#ffffff] hover:bg-[#FFD13F] disabled:hover:bg-[#FFC20E]`;

/** Everything else, on light backgrounds. */
export const buttonSecondary = `${base} border-[1.5px] border-[#B7CDBB] bg-white text-[#10201A] hover:border-[#0A3B22] hover:bg-[#F2F6F1]`;