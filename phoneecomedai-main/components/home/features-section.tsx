"use client";

import { motion } from "framer-motion";
import { 
  Heart, 
  Brain, 
  Smartphone, 
  Stethoscope, 
  Activity, 
  LineChart 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Heart,
    title: "Heart Sound Analysis",
    description: "Analyze heart sounds to detect murmurs, arrhythmias, and other cardiac conditions with clinical-grade accuracy."
  },
  {
    icon: Stethoscope,
    title: "Lung Sound Analysis",
    description: "Identify respiratory conditions by analyzing lung sounds for wheezes, crackles, and other abnormalities."
  },
  {
    icon: Brain,
    title: "AI-Powered Diagnostics",
    description: "Advanced neural networks trained on millions of clinical samples provide accurate diagnostic suggestions."
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Track vital signs and health metrics in real-time with continuous monitoring and alerts."
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description: "Forecast health trends and potential issues before they become serious using predictive AI models."
  },
  {
    icon: Smartphone,
    title: "Mobile Accessibility",
    description: "Access professional-grade diagnostics anywhere, anytime using just your smartphone."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">AI-Powered Features</h2>
          <p className="text-muted-foreground text-lg">
            EchoMed transforms your smartphone into a powerful diagnostic tool with these cutting-edge features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}