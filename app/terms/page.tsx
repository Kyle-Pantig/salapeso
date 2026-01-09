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
            <h2 className="text-xl font-semibold mb-4">7. Third-Party Trademarks & Credits</h2>
            <p className="text-muted-foreground mb-4">
              SalaPeso displays logos and trademarks of various banks, e-wallets, and financial institutions 
              for identification purposes only. These trademarks are the property of their respective owners. 
              SalaPeso is not affiliated with, endorsed by, or sponsored by any of these companies.
            </p>
            
            <h3 className="text-lg font-medium mb-3 mt-6">E-Wallets</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>GCash</strong> is a trademark of G-Xchange, Inc. (Mynt)</li>
              <li><strong>Maya</strong> (formerly PayMaya) is a trademark of Maya Philippines, Inc.</li>
              <li><strong>GrabPay</strong> is a trademark of Grab Holdings Inc.</li>
              <li><strong>ShopeePay</strong> is a trademark of Shopee</li>
              <li><strong>Coins.ph</strong> is a trademark of Coins.ph</li>
              <li><strong>PayPal</strong> is a trademark of PayPal Holdings, Inc.</li>
              <li><strong>Lazada Wallet</strong> is a trademark of Lazada Group</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">Digital Banks</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>GoTyme Bank</strong> is a trademark of GoTyme Bank Corporation</li>
              <li><strong>Tonik</strong> is a trademark of Tonik Digital Bank, Inc.</li>
              <li><strong>Maya Bank</strong> is a trademark of Maya Bank, Inc.</li>
              <li><strong>MariBank</strong> is a trademark of MariBank Philippines (formerly SeaBank)</li>
              <li><strong>CIMB Bank</strong> is a trademark of CIMB Bank Philippines, Inc.</li>
              <li><strong>ING</strong> is a trademark of ING Group</li>
              <li><strong>Komo</strong> is a trademark of East West Banking Corporation</li>
              <li><strong>UNO Digital Bank</strong> is a trademark of UNO Digital Bank, Inc.</li>
              <li><strong>OwnBank</strong> is a trademark of OwnBank, Inc.</li>
              <li><strong>Overseas Filipino Bank (OFBank)</strong> is a trademark of Land Bank of the Philippines</li>
              <li><strong>DiskarTech</strong> is a trademark of Rizal Commercial Banking Corporation</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">Traditional Banks</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>BPI</strong> (Bank of the Philippine Islands) is a trademark of BPI</li>
              <li><strong>BDO</strong> (Banco de Oro) is a trademark of BDO Unibank, Inc.</li>
              <li><strong>Metrobank</strong> is a trademark of Metropolitan Bank & Trust Company</li>
              <li><strong>LandBank</strong> is a trademark of Land Bank of the Philippines</li>
              <li><strong>UnionBank</strong> is a trademark of Union Bank of the Philippines</li>
              <li><strong>PNB</strong> (Philippine National Bank) is a trademark of PNB</li>
              <li><strong>Security Bank</strong> is a trademark of Security Bank Corporation</li>
              <li><strong>RCBC</strong> (Rizal Commercial Banking Corporation) is a trademark of RCBC</li>
              <li><strong>China Bank</strong> is a trademark of China Banking Corporation</li>
              <li><strong>EastWest Bank</strong> is a trademark of East West Banking Corporation</li>
              <li><strong>PSBank</strong> is a trademark of Philippine Savings Bank</li>
              <li><strong>AUB</strong> (Asia United Bank) is a trademark of Asia United Bank</li>
              <li><strong>DBP</strong> (Development Bank of the Philippines) is a trademark of DBP</li>
              <li><strong>Robinsons Bank</strong> is a trademark of Robinsons Bank Corporation</li>
              <li><strong>Bank of Commerce</strong> is a trademark of Bank of Commerce</li>
              <li><strong>PBCom</strong> (Philippine Bank of Communications) is a trademark of PBCom</li>
              <li><strong>Sterling Bank of Asia</strong> is a trademark of Sterling Bank of Asia</li>
              <li><strong>Veterans Bank</strong> is a trademark of Philippine Veterans Bank</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">International Banks</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>Maybank</strong> is a trademark of Malayan Banking Berhad</li>
              <li><strong>HSBC</strong> is a trademark of HSBC Holdings plc</li>
              <li><strong>Citibank</strong> is a trademark of Citigroup Inc.</li>
              <li><strong>Standard Chartered</strong> is a trademark of Standard Chartered PLC</li>
            </ul>

            <p className="text-muted-foreground mb-4 mt-6">
              All logos are used solely for the purpose of helping users identify their savings accounts. 
              If you are a trademark owner and have concerns about the use of your logo, please contact us 
              at <a href="mailto:salapeso.dev@gmail.com" className="text-primary hover:underline">salapeso.dev@gmail.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              SalaPeso shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the Service. This includes but is not 
              limited to damages for loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, 
              either express or implied. We do not warrant that the Service will be uninterrupted, secure, 
              or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without 
              prior notice or liability, under our sole discretion, for any reason whatsoever, including 
              without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
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

