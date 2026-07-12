import type { CSSProperties } from "react";
import { env } from "@/lib/env";

/**
 * Template email de bienvenue (bloc `notifications`).
 *
 * Composant React "email-safe" : styles inline uniquement, layout en table,
 * aucune dépendance externe. Rendu en HTML par Resend via l'option `react`
 * (cf. lib/email/send.ts). Réutilisable/testable en isolation.
 */

export type WelcomeEmailProps = {
  /** Prénom ou nom affiché ; fallback générique si absent. */
  name?: string;
  /** URL de destination du bouton d'action (ex. dashboard). */
  actionUrl?: string;
  /** Nom du produit, pour la signature. */
  productName?: string;
};

const main: CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "24px 0",
  margin: 0,
};

const container: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "32px",
};

const heading: CSSProperties = {
  color: "#18181b",
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 16px",
};

const paragraph: CSSProperties = {
  color: "#3f3f46",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const button: CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "10px 20px",
  textDecoration: "none",
};

const footer: CSSProperties = {
  color: "#a1a1aa",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
};

export function WelcomeEmail({
  name,
  actionUrl = env.NEXT_PUBLIC_SITE_URL,
  productName = "the app",
}: WelcomeEmailProps) {
  const greetingName = name?.trim() ? name.trim() : "there";

  return (
    <html lang="en">
      <body style={main}>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={container}
                >
                  <tbody>
                    <tr>
                      <td>
                        <h1 style={heading}>Welcome, {greetingName} 👋</h1>
                        <p style={paragraph}>
                          Thanks for signing up for {productName}. Your account
                          is ready — jump in and start exploring.
                        </p>
                        <p style={{ margin: "0 0 24px" }}>
                          <a href={actionUrl} style={button}>
                            Open your dashboard
                          </a>
                        </p>
                        <p style={paragraph}>
                          If you didn&apos;t create this account, you can safely
                          ignore this email.
                        </p>
                        <p style={footer}>
                          — The {productName} team
                          <br />
                          <a
                            href={env.NEXT_PUBLIC_SITE_URL}
                            style={{ color: "#a1a1aa" }}
                          >
                            {env.NEXT_PUBLIC_SITE_URL}
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export default WelcomeEmail;
