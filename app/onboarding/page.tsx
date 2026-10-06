import type { Metadata } from "next";
import Welcome from "@/components/onboarding/Welcome";

export const metadata: Metadata = {
  title: "Welcome to Konvoy",
};

export default function OnboardingPage() {
  return <Welcome />;
}