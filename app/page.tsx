'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedButtonGroup } from "@/components/ui/animated-button-group"
import { Header, MaxWidthLayout } from "@/components/layouts"
import { ArrowRight, PiggyBank, Target, TrendingUp, BarChart3 } from "lucide-react"
import { cookies } from "@/lib/cookies"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const token = cookies.getToken()
    setIsAuthenticated(!!token)
    setMounted(true)
  }, [])
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <MaxWidthLayout className="py-20 md:py-32 relative">
          <motion.div
            className="flex flex-col items-center text-center gap-8 relative"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium relative z-10"
            >
              Your Savings Journey Starts Here
            </motion.div>
            
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl relative z-10"
            >
              Track Your
              <span className="text-primary relative">
                {" "}Savings
                {/* Mascot next to Savings */}
                <motion.span
                  className="absolute -right-10 sm:-right-24 md:-right-48 lg:-right-56 -top-20 sm:-top-24 md:-top-28 lg:-top-32 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.5, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.span
                    className="block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Image
                      src="/SalaPesoImages/welcome.png"
                      alt="SalaPeso Mascot"
                      width={256}
                      height={256}
                      priority
                      className="w-[80px] sm:w-[100px] md:w-[170px] lg:w-[220px] h-auto"
                    />
                  </motion.span>
                </motion.span>
              </span>,
              <br />Reach Your Goals
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl relative z-10"
            >
              SalaPeso helps you track and visualize your savings progress. 
              Set goals, log your savings, and watch your money grow.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              {!mounted ? (
                // Skeleton while checking auth
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-36 rounded-full" />
                  <Skeleton className="h-12 w-40 rounded-full" />
                </div>
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full gap-2">
                    Go to Dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <AnimatedButtonGroup
                  primaryText="Get Started"
                  primaryHref="/signup"
                  secondaryText="See how It Works"
                  secondaryHref="#how-it-works"
                />
              )}
              
              <a 
                href="https://www.kylepantig.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors"
              >
                Proudly developed by <span className="font-bold ml-1">Kyle Pantig</span>
              </a>
            </motion.div>
          </motion.div>
        </MaxWidthLayout>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30 scroll-mt-20">
        <MaxWidthLayout>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple tools to track your savings
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No complicated features. Just what you need to save smarter.
            </p>
          </motion.div>
          
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard
              icon={<Target className="size-6" />}
              title="Set Savings Goals"
              description="Create goals for anything - emergency fund, vacation, or new gadget"
              delay={0}
            />
            <FeatureCard
              icon={<PiggyBank className="size-6" />}
              title="Log Your Savings"
              description="Manually track every peso you save towards your goals"
              delay={0.1}
            />
            <FeatureCard
              icon={<TrendingUp className="size-6" />}
              title="Track Progress"
              description="See how close you are to reaching each savings goal"
              delay={0.2}
            />
            <FeatureCard
              icon={<BarChart3 className="size-6" />}
              title="View History"
              description="Look back at your savings journey with simple charts"
              delay={0.3}
            />
          </motion.div>
        </MaxWidthLayout>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20 scroll-mt-20">
        <MaxWidthLayout>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to start tracking your savings
            </p>
          </motion.div>
          
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <StepCard number={1} title="Create a Goal" description="Set a target amount and give your goal a name" image="/SalaPesoImages/create.png" delay={0} />
            <StepCard number={2} title="Log Your Savings" description="Add entries whenever you save money" image="/SalaPesoImages/log.png" delay={0.1} />
            <StepCard number={3} title="Watch It Grow" description="Track your progress and celebrate milestones" image="/SalaPesoImages/watch.png" delay={0.2} />
          </motion.div>
        </MaxWidthLayout>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <MaxWidthLayout>
          <motion.div
            className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-visible"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative mascot images */}
            <motion.div 
              className="absolute -bottom-10 left-2 md:bottom-4 md:left-8 w-28 h-28 md:w-40 md:h-40 pointer-events-none select-none"
              animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/SalaPesoImages/tracking.png"
                alt=""
                fill
                className="object-contain"
              />
              {/* Mobile-only shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/20 rounded-full blur-sm md:hidden" />
            </motion.div>
            <motion.div 
              className="absolute -top-12 -right-3 md:-top-4 md:right-4 w-28 h-28 md:w-36 md:h-36 pointer-events-none select-none z-50"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Image
                src="/SalaPesoImages/add_wallet.png"
                alt=""
                fill
                className="object-contain"
              />
            </motion.div>
            {!mounted ? (
              <Skeleton className="h-10 w-80 mx-auto mb-4 bg-primary-foreground/20 relative z-10" />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
                {isAuthenticated ? "Ready to reach your goals?" : "Start tracking your savings today"}
              </h2>
            )}
            {!mounted ? (
              <Skeleton className="h-6 w-96 mx-auto mb-8 bg-primary-foreground/20 relative z-10" />
            ) : (
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto relative z-10">
                {isAuthenticated 
                  ? "Head to your dashboard and keep tracking your savings progress."
                  : "It's free, simple, and helps you stay motivated to reach your goals."
                }
              </p>
            )}
            {!mounted ? (
              <Skeleton className="h-12 w-48 mx-auto rounded-full bg-primary-foreground/20 relative z-10" />
            ) : (
              <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="relative z-10">
                <Button size="lg" variant="secondary" className="gap-2">
                  {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </motion.div>
        </MaxWidthLayout>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <MaxWidthLayout>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/salapeso-logo.png"
                alt="SalaPeso"
                width={120}
                height={35}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground hover:underline">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground hover:underline">
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SalaPeso. All rights reserved.
            </p>
          </div>
        </MaxWidthLayout>
      </footer>
    </>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  delay = 0,
}: { 
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border hover:shadow-lg transition-shadow"
    >
      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  )
}

function StepCard({
  number,
  title,
  description,
  image,
  delay = 0,
}: {
  number: number
  title: string
  description: string
  image?: string
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      {image ? (
        <div className="relative mb-4">
          <motion.div
            className="relative w-24 h-24 md:w-28 md:h-28 mx-auto"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain"
            />
          </motion.div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
            {number}
          </div>
        </div>
      ) : (
        <motion.div
          className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {number}
        </motion.div>
      )}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  )
}
