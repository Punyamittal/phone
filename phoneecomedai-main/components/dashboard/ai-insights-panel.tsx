"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface AIInsightsPanelProps {
  className?: string;
}

export function AIInsightsPanel({ className }: AIInsightsPanelProps) {
  const insights = [
    {
      id: 1,
      type: "info",
      title: "Heart Rate Variability",
      description: "Your heart rate variability has improved by 12% over the past week, indicating better cardiovascular health and stress management.",
      icon: Info,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 2,
      type: "warning",
      title: "Respiratory Pattern Change",
      description: "Slight irregularities detected in your breathing pattern during sleep. Consider recording additional lung sounds for further analysis.",
      icon: AlertTriangle,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      id: 3,
      type: "success",
      title: "Exercise Impact",
      description: "Your recent increase in physical activity has positively affected your resting heart rate, which has decreased by 3 BPM on average.",
      icon: CheckCircle2,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>AI Health Insights</CardTitle>
              <CardDescription>Personalized analysis based on your data</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <Button variant="outline" className="w-full">Generate New Insights</Button>
        </div>
      </CardContent>
    </Card>
  );
}