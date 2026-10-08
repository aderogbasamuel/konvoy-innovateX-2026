import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Konvoy",
    short_name: "Konvoy",
    description: "Safe rides for NYSC corpers to camp and their posting states.",
    start_url: "/home",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F2F6F1",
    theme_color: "#0A3B22",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}