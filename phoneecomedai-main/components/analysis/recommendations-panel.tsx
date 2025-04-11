"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Activity, 
  Utensils, 
  Clock, 
  Calendar, 
  ChevronRight,
  ArrowRight
} from "lucide-react";

export function RecommendationsPanel() {
  const recommendations = [
    {
      id: 1,
      title: "Continue Regular Monitoring",
      description: "Schedule weekly heart sound recordings to track any changes over time.",
      icon: Heart,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      action: "Schedule",
    },
    {
      id: 2,
      title: "Maintain Physical Activity",
      description: "Your heart sounds indicate good cardiovascular health. Continue with moderate exercise 3-5 times per week.",
      icon: Activity,
      iconColor: "text-chart-4",
      bgColor: "bg-chart-4/10",
      action: "View Exercises",
    },
    {
      id: 3,
      title: "Heart-Healthy Diet",
      description: "Consider incorporating more omega-3 fatty acids and reducing sodium intake to maintain optimal heart health.",
      icon: Utensils,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/10",
      action: "Diet Tips",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Recommendations</CardTitle>
        <CardDescription>
          AI-generated suggestions based on your analysis results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full ${recommendation.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <recommendation.icon className={`h-5 w-5 ${recommendation.iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        {recommendation.action}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-medium">Follow-up Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Based on your results, we recommend a routine follow-up with your healthcare provider within the next 6 months.
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Recommended by October 15, 2025</span>
                </div>
                <Button variant="link" size="sm" className="gap-1">
                  Schedule Appointment
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}