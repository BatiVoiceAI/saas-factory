import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { brand } from "@/lib/brand";
import { env } from "@/lib/env";
import "./globals.css";

// Source de vérité du branding : `lib/brand.ts` (renseigné au walking skeleton,
// étape 12). Le `template` propage le nom du produit à toutes les pages — les
// titres SEO par page (étape 16) n'ont qu'à fournir la partie `%s`.
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
