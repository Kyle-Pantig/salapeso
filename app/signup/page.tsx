import { Metadata } from "next"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free SalaPeso account and start tracking your savings goals today.",
  openGraph: {
    title: "Sign Up - SalaPeso",
    description: "Create your free SalaPeso account and start tracking your savings goals today.",
  },
}

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
