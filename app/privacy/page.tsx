import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { MaxWidthLayout } from "@/components/layouts"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how SalaPeso collects, uses, and protects your personal information. Your privacy matters to us.",
  openGraph: {
    title: "Privacy Policy - SalaPeso",
    description: "Learn how SalaPeso protects your personal information and privacy.",
  },
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 9, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to SalaPeso. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              savings tracking application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect and process the following types of information:
            </p>
            
            <h3 className="text-lg font-medium mb-3 mt-6">Account Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Name (optional)</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Profile picture (if using Google Sign-In)</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">Savings Data</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Savings goals and their names</li>
              <li>Wallet/bank selections</li>
              <li>Deposit and withdrawal amounts</li>
              <li>Transaction notes</li>
              <li>Target amounts</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">Technical Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Cookies and usage data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide and maintain our Service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Display your savings data and track your progress</li>
              <li>Send password reset emails when requested</li>
              <li>Improve and optimize our Service</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Passwords are hashed using bcrypt encryption</li>
              <li>Data is stored in secure, encrypted databases</li>
              <li>We use HTTPS for all data transmission</li>
              <li>Authentication tokens are securely managed</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              While we implement safeguards to protect your information, no method of transmission over the 
              Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Service Providers:</strong> We may share data with trusted third-party services that help us operate our Service (e.g., database hosting, email services)</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
              <li><strong>Protection:</strong> We may share information to protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              Our Service integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Google Sign-In:</strong> If you choose to sign in with Google, we receive your name, email, and profile picture from Google. Please review Google&apos;s Privacy Policy for their data practices.</li>
              <li><strong>Supabase:</strong> We use Supabase for database and authentication services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences (like dark/light mode)</li>
              <li>Understand how you use our Service</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You can control cookies through your browser settings, but disabling them may affect the 
              functionality of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Request a portable copy of your data</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, please contact us at the email address provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal data for as long as your account is active or as needed to provide you 
              with our Service. If you delete your account, we will delete your personal data within 30 days, 
              except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Our Service is not intended for children under the age of 13. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe your 
              child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are 
              advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:salapeso.dev@gmail.com" className="text-primary hover:underline">
                  salapeso.dev@gmail.com
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
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

