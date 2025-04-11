"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Activity, 
  Heart, 
  Wind, 
  Stethoscope, 
  Clock, 
  Zap,
  ArrowUpRight,
  Calendar,
  BarChart2
} from "lucide-react";

export function RecentActivities() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Define activities with static icon components
  const activities = [
    {
      id: 1,
      title: "Heart Sound Recording",
      time: "Today, 9:41 AM",
      iconType: "heart",
      type: "cardiac",
      duration: "2m 30s",
      details: "Normal sinus rhythm detected. Heart rate: 72 BPM.",
      metrics: [
        { label: "BPM", value: "72" },
        { label: "Rhythm", value: "Normal" },
        { label: "Quality", value: "Good" }
      ]
    },
    {
      id: 2,
      title: "Lung Sound Analysis",
      time: "Yesterday, 8:15 PM",
      iconType: "lung",
      type: "respiratory",
      duration: "1m 45s",
      details: "Clear lung sounds. No abnormalities detected.",
      metrics: [
        { label: "Clarity", value: "High" },
        { label: "Breathing", value: "Normal" },
        { label: "Quality", value: "Excellent" }
      ]
    },
    {
      id: 3,
      title: "Exercise Session",
      time: "Yesterday, 6:30 AM",
      iconType: "activity",
      type: "fitness",
      duration: "32m 15s",
      details: "Morning jog. Distance: 3.2km. Calories: 245.",
      metrics: [
        { label: "Distance", value: "3.2km" },
        { label: "Calories", value: "245" },
        { label: "Pace", value: "6'05\"/km" }
      ]
    },
    {
      id: 4,
      title: "ECG Recording",
      time: "2 days ago, 10:22 AM",
      iconType: "stethoscope",
      type: "cardiac",
      duration: "30s",
      details: "Single-lead ECG. Normal QRS complex. No arrhythmias detected.",
      metrics: [
        { label: "PR Interval", value: "160ms" },
        { label: "QRS", value: "90ms" },
        { label: "QT", value: "380ms" }
      ]
    },
  ];

  // Function to render the appropriate icon based on type
  const renderIcon = (type: string) => {
    switch (type) {
      case "heart":
        return <Heart className="h-5 w-5 text-rose-500" />;
      case "lung":
        return <Wind className="h-5 w-5 text-blue-500" />;
      case "activity":
        return <Activity className="h-5 w-5 text-green-500" />;
      case "stethoscope":
        return <Stethoscope className="h-5 w-5 text-amber-500" />;
      default:
        return <Activity className="h-5 w-5 text-primary" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case "heart":
        return "bg-rose-500/10";
      case "lung":
        return "bg-blue-500/10";
      case "activity":
        return "bg-green-500/10";
      case "stethoscope":
        return "bg-amber-500/10";
      default:
        return "bg-primary/10";
    }
  };

  const handleViewDetails = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Recent Activities
              <Badge variant="outline" className="ml-2 bg-primary/5 text-primary">
                {activities.length}
              </Badge>
            </CardTitle>
            <CardDescription>Your latest health recordings and activities</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  delay: index * 0.1 
                }}
                onMouseEnter={() => setHoveredId(activity.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative"
              >
                <motion.div
                  className={`rounded-lg p-3 ${hoveredId === activity.id ? 'bg-muted/50' : ''} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`h-12 w-12 rounded-full ${getIconBgColor(activity.iconType)} flex items-center justify-center flex-shrink-0`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {renderIcon(activity.iconType)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{activity.title}</p>
                        <Badge variant="outline" className="text-xs font-normal">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {activity.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" /> {activity.duration}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0"
                      onClick={() => handleViewDetails(activity.id)}
                    >
                      {expandedId === activity.id ? (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 90 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedId === activity.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t">
                          <p className="text-sm mb-3">{activity.details}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {activity.metrics.map((metric, idx) => (
                              <div key={idx} className="bg-background rounded-md p-2 text-center">
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <p className="font-medium">{metric.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline" className="gap-1">
                              View Full Report <ArrowUpRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}