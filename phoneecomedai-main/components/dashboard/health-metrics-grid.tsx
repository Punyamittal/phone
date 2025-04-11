"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Wind, 
  Activity, 
  Thermometer, 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Maximize2,
  X
} from "lucide-react";

// Import recharts components individually to avoid any naming conflicts
import { ResponsiveContainer } from "recharts";
import { LineChart } from "recharts";
import { Line } from "recharts";
import { AreaChart } from "recharts";
import { Area } from "recharts";
import { BarChart } from "recharts";
import { Bar } from "recharts";
import { XAxis } from "recharts";
import { YAxis } from "recharts";
import { CartesianGrid } from "recharts";
import { Tooltip } from "recharts";

// Sample data for charts
const heartRateData = [
  { time: "12 AM", value: 62 },
  { time: "3 AM", value: 58 },
  { time: "6 AM", value: 65 },
  { time: "9 AM", value: 78 },
  { time: "12 PM", value: 82 },
  { time: "3 PM", value: 76 },
  { time: "6 PM", value: 74 },
  { time: "9 PM", value: 68 },
  { time: "Now", value: 64 },
];

const oxygenData = [
  { time: "12 AM", value: 97 },
  { time: "3 AM", value: 96 },
  { time: "6 AM", value: 97 },
  { time: "9 AM", value: 98 },
  { time: "12 PM", value: 98 },
  { time: "3 PM", value: 97 },
  { time: "6 PM", value: 97 },
  { time: "9 PM", value: 96 },
  { time: "Now", value: 97 },
];

const respiratoryRateData = [
  { time: "12 AM", value: 14 },
  { time: "3 AM", value: 13 },
  { time: "6 AM", value: 14 },
  { time: "9 AM", value: 16 },
  { time: "12 PM", value: 17 },
  { time: "3 PM", value: 16 },
  { time: "6 PM", value: 15 },
  { time: "9 PM", value: 14 },
  { time: "Now", value: 14 },
];

const temperatureData = [
  { time: "12 AM", value: 98.2 },
  { time: "3 AM", value: 98.0 },
  { time: "6 AM", value: 97.8 },
  { time: "9 AM", value: 98.4 },
  { time: "12 PM", value: 98.6 },
  { time: "3 PM", value: 98.8 },
  { time: "6 PM", value: 98.6 },
  { time: "9 PM", value: 98.4 },
  { time: "Now", value: 98.2 },
];

const activityData = [
  { day: "Mon", steps: 8245 },
  { day: "Tue", steps: 7890 },
  { day: "Wed", steps: 9120 },
  { day: "Thu", steps: 8670 },
  { day: "Fri", steps: 7650 },
  { day: "Sat", steps: 10240 },
  { day: "Sun", steps: 6780 },
];

export function HealthMetricsGrid() {
  const [timeRange, setTimeRange] = useState("day");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  const handleExpandCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <motion.h2 
          className="text-xl font-semibold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Health Metrics
        </motion.h2>
        <Tabs defaultValue="day" value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Heart Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            ...(expandedCard === "heart-rate" ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "80vw",
              height: "80vh",
              zIndex: 50,
            } : {})
          }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: expandedCard ? 0 : -5 }}
          onHoverStart={() => setHoveredCard("heart-rate")}
          onHoverEnd={() => setHoveredCard(null)}
          className={`${expandedCard === "heart-rate" ? "fixed inset-0 z-50 m-auto w-4/5 h-4/5 overflow-auto" : ""}`}
        >
          <Card className={`overflow-hidden h-full ${expandedCard === "heart-rate" ? "shadow-2xl" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle>Heart Rate</CardTitle>
                    <CardDescription>Beats per minute</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {expandedCard === "heart-rate" ? (
                    <Button variant="ghost" size="icon" onClick={() => setExpandedCard(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleExpandCard("heart-rate")}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">64 BPM</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
                    <span>4 BPM lower than yesterday</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Range</div>
                  <div className="text-sm text-muted-foreground">58-82 BPM</div>
                </div>
              </div>
              
              <div className={`${expandedCard === "heart-rate" ? "h-[calc(100%-120px)]" : "h-48"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartRateData}>
                    <defs>
                      <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                      domain={[50, 90]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white",
                        borderColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value) => [`${value} BPM`, "Heart Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(244, 63, 94)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "rgb(244, 63, 94)" }}
                      activeDot={{ r: 6, fill: "rgb(244, 63, 94)" }}
                      animationDuration={1000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="none" 
                      fillOpacity={1} 
                      fill="url(#heartRateGradient)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {expandedCard === "heart-rate" && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-xl font-bold">72 BPM</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Min</div>
                    <div className="text-xl font-bold">58 BPM</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Max</div>
                    <div className="text-xl font-bold">82 BPM</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* SpO2 Card - Replacing Blood Pressure Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            ...(expandedCard === "spo2" ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "80vw",
              height: "80vh",
              zIndex: 50,
            } : {})
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: expandedCard ? 0 : -5 }}
          onHoverStart={() => setHoveredCard("spo2")}
          onHoverEnd={() => setHoveredCard(null)}
          className={`${expandedCard === "spo2" ? "fixed inset-0 z-50 m-auto w-4/5 h-4/5 overflow-auto" : ""}`}
        >
          <Card className={`overflow-hidden h-full ${expandedCard === "spo2" ? "shadow-2xl" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>SpO2</CardTitle>
                    <CardDescription>Oxygen Saturation</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {expandedCard === "spo2" ? (
                    <Button variant="ghost" size="icon" onClick={() => setExpandedCard(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleExpandCard("spo2")}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative pt-8">
                <div 
                  className={`absolute top-0 right-0 px-2.5 py-1 rounded-full text-xs font-medium ${parseInt(oxygenData[oxygenData.length - 1].value.toString()) >= 95 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                >
                  {parseInt(oxygenData[oxygenData.length - 1].value.toString()) >= 95 ? 'Normal' : 'Low'}
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{oxygenData[oxygenData.length - 1].value}</span>
                  <span className="ml-1">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseInt(oxygenData[oxygenData.length - 1].value.toString()) >= 95 ? 'Healthy oxygen saturation levels' : 'Lower than normal oxygen levels'}
                </p>
                
                <div className="h-[150px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={oxygenData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 10 }} 
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        domain={[90, 100]} 
                        tick={{ fontSize: 10 }} 
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                        }} 
                        labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={{ r: 3, stroke: "#a855f7", strokeWidth: 2, fill: "#ffffff" }}
                        activeDot={{ r: 5, stroke: "#a855f7", strokeWidth: 2, fill: "#a855f7" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div className="flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Current</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{oxygenData[oxygenData.length - 1].value}%</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Average</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {Math.round(oxygenData.reduce((acc, curr) => acc + curr.value, 0) / oxygenData.length)}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Target</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">95-100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}