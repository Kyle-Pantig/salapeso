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
  keywords: ["savings tracker", "personal finance", "money management", "savings goals", "financial planning", "budget tracker"],
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
