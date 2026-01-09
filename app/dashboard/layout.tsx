import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your savings goals and track your progress with SalaPeso.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

