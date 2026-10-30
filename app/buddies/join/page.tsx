"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { api, toRequestError, type ApiRequestError, type MyBuddy } from "@/lib/api";
import { STATES } from "@/lib/states";

const field =
  "min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none";

export default function JoinBuddyPage() {
  const [mine, setMine] = useState<MyBuddy | null>(null);
  const [loadError, setLoadError] = useState<ApiRequestError | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  const [state, setState] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [confirmStop, setConfirmStop] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    api.buddies
      .me()
      .then(({ buddy }) => {
        if (cancelled) return;
        setLoadError(null);
        setMine(buddy);
        if (buddy) {
          setState((s) => s || buddy.state);
          setBio((b) => b || buddy.bio || "");
        }
      })
      .catch((e: unknown) => !cancelled && setLoadError(toRequestError(e)));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  async function submit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!state || !whatsapp.trim() || !consent) return;
    setSaving(true);
    setSubmitError("");
    try {
      await api.buddies.become({ state, whatsapp: whatsapp.trim(), bio: bio.trim() || undefined, consent: true });
      setSubmitted(true);
      setAttempt((n) => n + 1);
    } catch (err) {
      setSubmitError(toRequestError(err).message);
    } finally {
      setSaving(false);
    }
  }

  async function stop(): Promise<void> {
    setSaving(true);
    try {
      await api.buddies.stop();
      setMine(null);
      setConfirmStop(false);
      setSubmitted(false);
    } catch (err) {
      setSubmitError(toRequestError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-10 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="Become a State Buddy" subtitle="Help new corpers who are heading to your state." />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        {loadError && (
          <div role="alert" className="rounded-3xl bg-white p-5 text-center shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
            <p className="m-0 font-semibold">{loadError.message}</p>
            {loadError.status === 401 ? (
              <Link href="/signin" className="mt-2 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">Sign in</Link>
            ) : (
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-2 min-h-12 font-semibold text-[#11603A] underline">Try again</button>
            )}
          </div>
        )}

        {mine && (
          <section aria-label="Your listing" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${mine.status === "approved" ? "bg-[#DCEBDD] text-[#11603A]" : "bg-[#FFF3C4] text-[#5C4400]"}`}>
              {mine.status === "approved" ? "Live" : "Waiting for review"}
            </span>
            <p className="m-0 mt-2 font-semibold">You are listed as a State Buddy in {mine.state}.</p>
            <p className="m-0 mt-1 text-sm text-[#4C5F55]">
              {mine.status === "approved" ? "Corpers heading to your state can message you on WhatsApp." : "We check every listing before it appears. Changing your details sends them for review again."}
            </p>
            {!confirmStop ? (
              <button type="button" onClick={() => setConfirmStop(true)} className="mt-3 min-h-12 font-semibold text-[#9B1C12] underline">Stop being a State Buddy</button>
            ) : (
              <div className="mt-3 flex items-center gap-4">
                <button type="button" onClick={stop} disabled={saving} className="min-h-12 rounded-[14px] border-[1.5px] border-[#9B1C12] px-4 font-semibold text-[#9B1C12] disabled:opacity-50">Yes, remove my listing</button>
                <button type="button" onClick={() => setConfirmStop(false)} className="min-h-12 font-semibold text-[#11603A] underline">Cancel</button>
              </div>
            )}
          </section>
        )}

        <form onSubmit={submit} className="grid gap-4 rounded-3xl bg-white p-5">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>{mine ? "Update your details" : "Your details"}</h2>

          <label className="grid gap-1.5 text-sm font-semibold">
            State you are serving in
            <select value={state} onChange={(e) => setState(e.target.value)} required className={field}>
              <option value="">Choose a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-semibold">
            WhatsApp number
            <input type="tel" inputMode="tel" autoComplete="tel-national" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0801 234 5678" required className={field} />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold">
            About you (optional)
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} placeholder="What can you help new corpers with?" className="rounded-[14px] border-2 border-[#D5E3D7] px-3.5 py-3 font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none" />
            <span className="text-xs font-normal text-[#4C5F55]">{bio.length} of 280</span>
          </label>

          <label className="flex min-h-12 items-start gap-3 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0A3B22]" />
            <span>I agree to share my WhatsApp number with corpers who open my listing.</span>
          </label>

          {submitError && <p role="alert" className="m-0 text-sm font-semibold text-[#9B1C12]">{submitError}</p>}
          {submitted && <p role="status" className="m-0 rounded-[14px] bg-[#DCEBDD] px-3.5 py-3 text-sm font-semibold text-[#11603A]">Thank you. We will review your listing before it appears.</p>}

          <button type="submit" disabled={saving || !state || !whatsapp.trim() || !consent} className="min-h-[52px] rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Saving..." : mine ? "Save changes" : "Become a State Buddy"}
          </button>
        </form>
      </div>
    </main>
  );
}