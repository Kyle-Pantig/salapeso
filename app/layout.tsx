import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@/components/providers/GoogleOAuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SalaPeso - Track Your Savings",
    template: "%s - SalaPeso",
  },
  description: "Simple and intuitive savings tracker to help you reach your financial goals. Track multiple savings goals, monitor progress, and achieve your dreams.",
  keywords: [
    "SalaPeso",
    "SalaPeso app",
    "SalaPeso savings",
    "SalaPeso money",
    "SalaPeso finance",
    "SalaPeso budget",
    "SalaPeso goals",
    "SalaPeso planning",
    "SalaPeso tracker",
    "SalaPeso savings tracker",
    "SalaPeso money tracker",
    "SalaPeso finance tracker",
    "SalaPeso budget tracker",
    "SalaPeso goals tracker",
    "SalaPeso planning tracker",
    "SalaPeso tracker",
    "SalaPeso savings tracker",
    "SalaPeso money tracker",
    "savings tracker",
    "personal finance",
    "money management",
    "savings goals",
    "financial planning",
    "budget tracker",
    "Philippine savings app",
    "ipon tracker",
    "GCash savings",
    "Maya savings",
    "e-wallet tracker",
    "bank savings tracker",
    "peso savings",
    "money tracker Philippines",
    "alkansya app",
    "ipon challenge",
    "52 week challenge",
    "financial goals",
    "expense tracker",
    "savings jar",
    "digital piggy bank",
    "track savings Philippines",
    "BPI savings",
    "BDO savings",
    "unionbank tracker",
  ],
  authors: [{ name: "Kyle Pantig", url: "https://www.kylepantig.site" }],
  creator: "Kyle Pantig",
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "SalaPeso",
    title: "SalaPeso - Track Your Savings",
    description: "Simple and intuitive savings tracker to help you reach your financial goals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SalaPeso - Track Your Savings",
    description: "Simple and intuitive savings tracker to help you reach your financial goals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="SalaPeso" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <GoogleOAuthProvider>
              {children}
            </GoogleOAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
