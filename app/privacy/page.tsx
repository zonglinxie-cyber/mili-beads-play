import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrivacyContent } from "../privacy-content";

export default function PrivacyPage() {
  return <main className="privacy-page">
    <Link href="/" className="privacy-route-back"><ArrowLeft aria-hidden="true"/>返回米粒拼豆社</Link>
    <PrivacyContent />
  </main>;
}
