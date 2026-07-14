import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { Placeholder } from "@/app/legal/_components/placeholder";

/**
 * Template « Privacy Policy » — **US/EN** jurisdiction. Shipped alongside the 4
 * legal templates; kept at build time when `jurisdiction` is US/EN.
 *
 * Company-specific values are `<Placeholder>` tokens substituted at build
 * (controller, retention, processors, contact). The surrounding prose is
 * generic and aligned with common privacy rights (access, correction,
 * deletion, opt-out).
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${brand.name} collects, uses, and protects your personal data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        This Privacy Policy explains how {brand.name}, operated by{" "}
        <Placeholder>LEGAL_ENTITY</Placeholder>, collects, uses, and protects
        your personal information when you use the Service.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> you provide (email address, and
          optionally name and profile details);
        </li>
        <li>
          <strong>Usage data</strong> generated as you use the Service (content
          you create, preferences);
        </li>
        <li>
          <strong>Technical data</strong> such as log files, IP address, and
          browser type, used for security and reliability.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>to provide, maintain, and secure the Service;</li>
        <li>
          to send you Service-related emails (sign-in, notifications);
        </li>
        <li>to improve the Service and understand how it is used;</li>
        <li>to comply with legal obligations.</li>
      </ul>

      <h2>Sharing and processors</h2>
      <p>
        We do not sell your personal information. We share it only with
        service providers who process it on our behalf, under contract and for
        the purposes described here (hosting, email delivery, analytics,
        payment): <Placeholder>LIST_PROCESSORS</Placeholder>. We may also
        disclose information where required by law.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain account data for as long as your account is active, and for{" "}
        <Placeholder>RETENTION_PERIOD</Placeholder> thereafter, unless a longer
        period is required by law.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct,
        delete, or export your personal information, and to object to or
        restrict certain processing. To exercise these rights, contact us at{" "}
        <Placeholder>EMAIL_CONTACT</Placeholder>.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies that are strictly necessary to operate the Service and,
        subject to your choices, cookies for analytics. You can manage cookies
        through your browser settings.
      </p>

      <h2>Security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect
        your information. No method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will revise the
        “last updated” date below and, where appropriate, notify you of material
        changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Contact us at{" "}
        <Placeholder>EMAIL_CONTACT</Placeholder>.
      </p>

      <p>
        Last updated: <Placeholder>DATE_UPDATED</Placeholder>.
      </p>
    </>
  );
}
