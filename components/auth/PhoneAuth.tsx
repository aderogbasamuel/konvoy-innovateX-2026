
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";

type Step = "phone" | "code" | "name";

interface PhoneAuthProps {
  mode: "signup" | "signin";
}

const PHONE_RE = /^0?[789][01]\d{8}$/;

const input =
  "min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base text-[#10201A] placeholder:text-[#6B7D72] focus-visible:border-[#0A3B22] focus-visible:outline-none";

const primary =
  "mt-5 min-h-[52px] w-full rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:cursor-not-allowed disabled:opacity-60";

export default function PhoneAuth({ mode }: PhoneAuthProps) {
  const router = useRouter();
  const { requestOtp, verifyOtp, updateUser } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const display = `+234 ${digits.replace(/^0/, "")}`;

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  async function sendCode(e: FormEvent) {
    e.preventDefault();

    if (!PHONE_RE.test(digits)) {
      setError("Enter a valid Nigerian phone number, like 0801 234 5678.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await requestOtp(digits);
      setStep("code");
      setSeconds(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = (await verifyOtp(digits, code)) as {
        is_new_user: boolean;
      };

      if (result.is_new_user) {
        setStep("name");
      } else {
        router.replace("/home");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();

    const name = fullName.trim();

    if (name.length < 2 || name.length > 120) {
      setError("Your name must be between 2 and 120 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await updateUser({ full_name: name });
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your name. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (seconds > 0 || loading) return;

    setError("");
    setLoading(true);

    try {
      await requestOtp(digits);
      setSeconds(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  const title =
    step === "name"
      ? "Let's get to know you"
      : isSignup
        ? "Create your account"
        : "Welcome back";

  const subtitle =
    step === "phone"
      ? "We will text you a code to verify your number."
      : step === "code"
        ? `Enter the code we sent to ${display}.`
        : "What should we call you? Add your name to finish setting up your account.";

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title={title} subtitle={subtitle} />

      <div className="mx-auto -mt-10 max-w-md px-5 pb-10">
        <div className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          {step === "phone" && (
            <form onSubmit={sendCode} noValidate>
              <label className="grid gap-1.5 text-sm font-semibold">
                Phone number

                <span className="flex gap-2">
                  <span
                    className="grid min-h-[52px] place-items-center rounded-[14px] bg-[#E4EFE5] px-3.5 font-semibold"
                    aria-hidden="true"
                  >
                    +234
                  </span>

                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    aria-invalid={!!error}
                    className={input}
                    disabled={loading}
                  />
                </span>
              </label>

              {error && (
                <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">
                  {error}
                </p>
              )}

              <button type="submit" className={primary} disabled={loading}>
                {loading ? "Sending code..." : "Send code"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={verify} noValidate>
              <label className="grid gap-1.5 text-sm font-semibold">
                6-digit code

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  aria-invalid={!!error}
                  className={`${input} text-center text-2xl font-semibold tracking-[0.4em]`}
                  disabled={loading}
                />
              </label>

              {error && (
                <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">
                  {error}
                </p>
              )}

              <button type="submit" className={primary} disabled={loading}>
                {loading ? "Verifying..." : "Verify and continue"}
              </button>

              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setError("");
                  }}
                  className="min-h-12 font-semibold text-[#11603A]"
                  disabled={loading}
                >
                  Change number
                </button>

                <button
                  type="button"
                  disabled={seconds > 0 || loading}
                  onClick={resendCode}
                  className="min-h-12 font-semibold text-[#11603A] disabled:text-[#6B7D72]"
                >
                  {seconds > 0
                    ? `Resend code in 0:${String(seconds).padStart(2, "0")}`
                    : loading
                      ? "Sending..."
                      : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {step === "name" && (
            <form onSubmit={saveName} noValidate>
              <label className="grid gap-1.5 text-sm font-semibold">
                Full name

                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={120}
                  aria-invalid={!!error}
                  className={input}
                  disabled={loading}
                  autoFocus
                />
              </label>

              {error && (
                <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">
                  {error}
                </p>
              )}

              <button type="submit" className={primary} disabled={loading}>
                {loading ? "Saving your details..." : "Finish setup"}
              </button>
            </form>
          )}
        </div>

        {step !== "name" && (
          <p className="mt-6 text-center text-sm text-[#4C5F55]">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/signin" className="font-semibold text-[#11603A] underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Konvoy?{" "}
                <Link href="/signup" className="font-semibold text-[#11603A] underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </main>
  );
}