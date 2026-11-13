import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRIVACY } from "@/lib/terms";

export const metadata: Metadata = { title: "Privacy Policy // Dragon Valley Attack Ledger" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={PRIVACY} other={{ href: "/terms", label: "Terms of Service" }} />;
}
