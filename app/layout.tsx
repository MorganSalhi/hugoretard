// app/layout.tsx
import "./global.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast"; // Un seul import ici
import type { Metadata } from "next";
import RadioAlert from "@/components/RadioAlert";

export const metadata: Metadata = {
  title: "HugoLate",
  description: "Le betting haute précision sur le retard d'Hugo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Providers>
          <RadioAlert />
          <main className="pb-24">
            {children}
          </main>
          {/* Le Toaster est placé ici, une seule fois */}
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}