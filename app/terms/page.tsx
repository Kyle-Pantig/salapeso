import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { MaxWidthLayout } from "@/components/layouts"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for SalaPeso. Learn about the rules and guidelines for using our savings tracking platform.",
  openGraph: {
    title: "Terms of Service - SalaPeso",
    description: "Read the Terms of Service for SalaPeso savings tracking platform.",
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-svh bg-muted/30">
      <MaxWidthLayout className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/salapeso-logo.png"
              alt="SalaPeso"
              width={140}
              height={40}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 9, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using SalaPeso (&quot;the Service&quot;), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              SalaPeso is a personal savings tracking application that allows users to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Track savings across multiple wallets and bank accounts</li>
              <li>Set and monitor savings goals</li>
              <li>Record deposits and withdrawals</li>
              <li>View transaction history and savings summaries</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> SalaPeso is a tracking tool only. We do not connect to any bank accounts, 
              process payments, or transfer funds. All data entered is self-reported by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>The accuracy of the financial data you enter into the Service</li>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Using the Service in compliance with all applicable laws</li>
              <li>Not using the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Accuracy</h2>
            <p className="text-muted-foreground mb-4">
              SalaPeso relies on user-provided data. We do not verify the accuracy of any financial information 
              you enter. The Service should be used as a personal tracking tool and not as a substitute for 
              official bank statements or financial records.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              The Service and its original content, features, and functionality are owned by SalaPeso and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              SalaPeso shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the Service. This includes but is not 
              limited to damages for loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, 
              either express or implied. We do not warrant that the Service will be uninterrupted, secure, 
              or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without 
              prior notice or liability, under our sole discretion, for any reason whatsoever, including 
              without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:salapeso.dev@gmail.com" className="text-primary hover:underline">
                salapeso.dev@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-foreground hover:underline">
            Back to Home
          </Link>
        </div>
      </MaxWidthLayout>
    </div>
  )
}

