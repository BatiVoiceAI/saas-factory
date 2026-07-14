import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { Placeholder } from "@/app/legal/_components/placeholder";

/**
 * Template « Terms of Service » — **US/EN** jurisdiction. Shipped alongside the
 * 4 legal templates; kept at build time when `jurisdiction` is US/EN.
 *
 * Company-specific values are `<Placeholder>` tokens substituted at build
 * (legal entity, governing law, contact). The surrounding prose is generic.
 */
export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing your use of ${brand.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>
        These Terms of Service (the “Terms”) govern your access to and use of{" "}
        {brand.name} (the “Service”), operated by{" "}
        <Placeholder>LEGAL_ENTITY</Placeholder> (“we”, “us”). By accessing or
        using the Service, you agree to be bound by these Terms.
      </p>

      <h2>1. Eligibility and accounts</h2>
      <p>
        You must be at least the age of majority in your jurisdiction to use the
        Service. You are responsible for the activity under your account and for
        keeping your credentials secure. Notify us promptly of any unauthorized
        use.
      </p>

      <h2>2. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service in violation of any applicable law or regulation;</li>
        <li>
          attempt to disrupt, reverse-engineer, or gain unauthorized access to
          the Service or its infrastructure;
        </li>
        <li>
          upload unlawful, infringing, or harmful content, or infringe the
          rights of others.
        </li>
      </ul>

      <h2>3. Subscriptions and payment</h2>
      <p>
        Paid plans, billing cycles, and fees are described at the point of
        purchase. Fees are billed in advance and are non-refundable except where
        required by law. We may change pricing with reasonable prior notice; the
        change applies to your next billing cycle.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        The Service, including its software, design, and content (excluding
        content you submit), is owned by us or our licensors and is protected by
        intellectual property laws. We grant you a limited, non-exclusive,
        non-transferable right to use the Service under these Terms. You retain
        ownership of the content you submit and grant us the license needed to
        operate the Service.
      </p>

      <h2>5. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate
        your access if you breach these Terms or if required for legal or
        security reasons. Upon termination, your right to use the Service ceases
        immediately.
      </p>

      <h2>6. Disclaimers and limitation of liability</h2>
      <p>
        The Service is provided “as is” and “as available”, without warranties
        of any kind to the maximum extent permitted by law. To the fullest
        extent permitted by law, our aggregate liability arising out of or
        relating to the Service is limited to the amount you paid us in the
        twelve months preceding the claim.
      </p>

      <h2>7. Governing law</h2>
      <p>
        These Terms are governed by the laws of{" "}
        <Placeholder>GOVERNING_LAW</Placeholder>, without regard to conflict-of-law
        principles. Any dispute shall be subject to the exclusive jurisdiction
        of the courts of <Placeholder>JURISDICTION_VENUE</Placeholder>.
      </p>

      <h2>8. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. When we do, we will revise
        the “last updated” date below and, where appropriate, notify you.
        Continued use of the Service after changes take effect constitutes
        acceptance.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <Placeholder>EMAIL_CONTACT</Placeholder>.
      </p>

      <p>
        Last updated: <Placeholder>DATE_UPDATED</Placeholder>.
      </p>
    </>
  );
}
