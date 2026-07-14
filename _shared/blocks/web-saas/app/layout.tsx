import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { brand } from "@/lib/brand";
import { env } from "@/lib/env";
import { dir, locale, ogLocale } from "@/lib/i18n";
import "./globals.css";

// Source de vérité du branding : `lib/brand.ts` (renseigné au walking skeleton,
// étape 12). Le `template` propage le nom du produit à toutes les pages — les
// titres SEO par page (étape 16) n'ont qu'à fournir la partie `%s`.
// La langue (`og:locale`) vient de `lib/i18n` (dérivée de `PRODUCT_LOCALE`) —
// jamais codée en dur ; l'étape 16 y aligne `hreflang`/`lang`.
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    locale: ogLocale,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // `lang` / `dir` dérivés de la locale produit (lib/i18n) — le `dir` vit sur
  // <html> pour un RTL réel (miroir de layout) sur ar/he/fa/ur. cf. CONVENTIONS §12.
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
