import type { Metadata, Viewport } from "next";
import { Nunito, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import PwaRegister from "@/components/community/pwa-register";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  // URL publique configurable (partages WhatsApp, aperçus sociaux) — sinon domaine par défaut
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://diaranguel.sn"),
  title: "Diaranguel — Jam Tan ! Le village de l'île à Morphil",
  description:
    "Diaranguel (arrondissement de Saldé, département de Podor, région de Saint-Louis) : tableau d'affichage officiel, agenda des cérémonies, annuaire des habitants et de la diaspora, santé & transport, carte du village et guide de route Dakar → Diaranguel consultable hors-ligne. Jaraama !",
  keywords: [
    "Diaranguel",
    "île à Morphil",
    "Podor",
    "Saldé",
    "Fouta-Toro",
    "Sénégal",
    "village",
    "diaspora",
    "halpulaar",
    "communauté",
  ],
  authors: [{ name: "Village de Diaranguel" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diaranguel",
  },
  openGraph: {
    title: "Diaranguel — Jam Tan !",
    description:
      "Le village connecté de l'île à Morphil : annonces officielles, agenda, annuaire, santé, transport, carte et histoire. Jaraama !",
    type: "website",
    locale: "fr_SN",
    images: ["/images/fleuve-seneegal.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f3d22",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${nunito.variable} ${fraunces.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
