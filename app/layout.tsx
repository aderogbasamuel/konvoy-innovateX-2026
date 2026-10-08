import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/context/AuthContext";
import RegisterSW from "@/components/RegisterSw";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-display",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});


export const metadata: Metadata = {
  title: "Konvoy: safe rides for NYSC corpers",
  description:
    "Book a verified ride to camp or your posting state, travel with other corpers, and let your family follow the trip live.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A3B22",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} bg-[#0A3B22]`}>
        <AuthProvider>{children}<RegisterSW /></AuthProvider>
      </body>
    </html>
  );
}