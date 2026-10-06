"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";

const input =
  "min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none";

export default function ProfilePage() {
  const router = useRouter();
  // TODO: load from GET /me
  const [firstName, setFirstName] = useState("Samuel");
  const [lastName, setLastName] = useState("");
  const phone = "+234 801 234 5678";
  const [saved, setSaved] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    // TODO: PATCH /me { firstName, lastName }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function signOut() {
    // TODO: POST /auth/logout and clear the session
    router.push("/onboarding");
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="Profile" subtitle={phone} showBack={false} />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <form onSubmit={save} className="grid gap-4 rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>Your details</h2>
          <label className="grid gap-1.5 text-sm font-semibold">
            First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" className={input} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" className={input} />
          </label>
          <button type="submit" className="min-h-[52px] rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]">
            <span aria-live="polite">{saved ? "Saved" : "Save changes"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={signOut}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#9B1C12] font-semibold text-[#9B1C12] hover:bg-[#FBEAE8] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#9B1C12]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>

      <BottomNav />
    </main>
  );
}