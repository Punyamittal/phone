"use client";

import { useState } from "react";
import { Stethoscope, Heart, Brain, Activity, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

// Dynamically import HeartRateMonitor to avoid SSR issues with camera access
const HeartRateMonitor = dynamic(
  () => import("@/app/heart-rate-monitor/page"),
  { ssr: false }
);

export function RecordingInterface() {
  const [heartRate, setHeartRate] = useState(72);
  const [confidence, setConfidence] = useState(98.7);
  const [variability, setVariability] = useState(42.9);
  const [trend, setTrend] = useState<"up" | "down" | null>("up");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Heart Analysis</h2>
            <p className="text-sm text-muted-foreground">Real-time Monitoring</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Measure Heart Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full h-[90vh] overflow-y-auto">
            <HeartRateMonitor />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Heart Rate</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{heartRate}</span>
            <div className="flex items-center gap-1 text-sm">
              <span>BPM</span>
              {trend && (
                <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                  {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Confidence</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{confidence}%</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">HRV Index</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{variability}</span>
            <span className="text-sm">ms</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assessment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm">Normal sinus rhythm detected</span>
        </div>
      </div>
    </div>
  );
}