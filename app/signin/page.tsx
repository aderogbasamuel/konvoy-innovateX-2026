import type { Metadata } from "next";
import PhoneAuth from "@/components/auth/PhoneAuth";

export const metadata: Metadata = { title: "Sign in to Konvoy" };

export default function SignInPage() {
  return <PhoneAuth mode="signin" />;
}