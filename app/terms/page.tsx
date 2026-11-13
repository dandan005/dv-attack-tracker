import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { TERMS } from "@/lib/terms";

export const metadata: Metadata = { title: "Terms of Service // Dragon Valley Attack Ledger" };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" sections={TERMS} other={{ href: "/privacy", label: "Privacy Policy" }} />;
}
