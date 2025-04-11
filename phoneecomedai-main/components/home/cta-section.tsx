"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />
          
          <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 lg:flex lg:items-center lg:justify-between">
            <div className="lg:max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Transform Your Healthcare Experience
              </h2>
              <p className="mt-4 text-lg opacity-90">
                Join millions of users who are taking control of their health with EchoMed's AI-powered diagnostics and personalized insights.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Advanced AI diagnostics in your pocket</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Personalized health insights and recommendations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Secure data storage and seamless doctor sharing</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col items-center lg:mt-0 lg:items-start">
              <Button size="lg" variant="secondary" asChild className="group">
                <Link href="/dashboard">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="mt-4 text-sm opacity-80">
                No credit card required. Start your free trial today.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}