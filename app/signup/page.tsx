
import type { Metadata } from "next";
import PhoneAuth from "@/components/auth/PhoneAuth";
 
export const metadata: Metadata = { title: "Create your Konvoy account" };
 
export default function SignUpPage() {
  return <PhoneAuth mode="signup" />;
}
 