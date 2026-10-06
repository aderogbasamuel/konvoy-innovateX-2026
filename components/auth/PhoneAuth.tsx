"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ui/ScreenHeader";

type Step = "phone" | "code";

interface PhoneAuthProps {
  mode: "signup" | "signin";
}

// Nigerian mobile numbers: 0801 234 5678 or 801 234 5678
const PHONE_RE = /^0?[789][01]\d{8}$/;

const input =
  "min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base text-[#10201A] placeholder:text-[#6B7D72] focus-visible:border-[#0A3B22] focus-visible:outline-none";
const primary =
  "mt-5 min-h-[52px] w-full rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]";

export default function PhoneAuth({ mode }: PhoneAuthProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const digits = phone.replace(/\D/g, "");
  const display = `+234 ${digits.replace(/^0/, "")}`;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(digits)) {
      setError("Enter a valid Nigerian phone number, like 0801 234 5678.");
      return;
    }
    setError("");
    // TODO: call your API to text a one-time code to `display`
    setStep("code");
    setSeconds(30);
  }

  function verify(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    setError("");
    // TODO: verify the code with your API and store the session
    router.push("/home");
  }

  const isSignup = mode === "signup";

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader
        title={isSignup ? "Create your account" : "Welcome back"}
        subtitle={step === "phone" ? "We will text you a code to verify your number." : `Enter the code we sent to ${display}.`}
      />

      <div className="mx-auto -mt-10 max-w-md px-5 pb-10">
        <div className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          {step === "phone" ? (
            <form onSubmit={sendCode} noValidate>
              <label className="grid gap-1.5 text-sm font-semibold">
                Phone number
                <span className="flex gap-2">
                  <span className="grid min-h-[52px] place-items-center rounded-[14px] bg-[#E4EFE5] px-3.5 font-semibold" aria-hidden="true">+234</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    aria-invalid={!!error}
                    className={input}
                  />
                </span>
              </label>
              {error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">{error}</p>}
              <button type="submit" className={primary}>Send code</button>
            </form>
          ) : (
            <form onSubmit={verify} noValidate>
              <label className="grid gap-1.5 text-sm font-semibold">
                6-digit code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  aria-invalid={!!error}
                  className={`${input} text-center text-2xl font-semibold tracking-[0.4em]`}
                />
              </label>
              {error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">{error}</p>}
              <button type="submit" className={primary}>Verify and continue</button>

              <div className="mt-3 flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); }} className="min-h-12 font-semibold text-[#11603A]">
                  Change number
                </button>
                <button
                  type="button"
                  disabled={seconds > 0}
                  onClick={() => { setSeconds(30); /* TODO: resend the code */ }}
                  className="min-h-12 font-semibold text-[#11603A] disabled:text-[#6B7D72]"
                >
                  {seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, "0")}` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#4C5F55]">
          {isSignup ? (
            <>Already have an account? <Link href="/signin" className="font-semibold text-[#11603A] underline">Sign in</Link></>
          ) : (
            <>New to Konvoy? <Link href="/signup" className="font-semibold text-[#11603A] underline">Create an account</Link></>
          )}
        </p>
      </div>
    </main>
  );
}