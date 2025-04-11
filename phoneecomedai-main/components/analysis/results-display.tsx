"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function ResultsDisplay() {
  const analysisResults = {
    primaryCondition: {
      name: "Normal Sinus Rhythm",
      confidence: 92,
      status: "normal",
    },
    confidenceScores: [
      { name: "Normal Sinus Rhythm", value: 92 },
      { name: "Sinus Tachycardia", value: 5 },
      { name: "Sinus Bradycardia", value: 2 },
      { name: "Other", value: 1 },
    ],
    keyFindings: [
      {
        id: 1,
        type: "normal",
        title: "Regular Rhythm",
        description: "Heart rhythm is regular with consistent intervals between beats.",
        icon: CheckCircle2,
        iconColor: "text-success",
      },
      {
        id: 2,
        type: "info",
        title: "Heart Rate",
        description: "Heart rate is 72 BPM, which falls within the normal range for adults.",
        icon: Info,
        iconColor: "text-primary",
      },
      {
        id: 3,
        type: "warning",
        title: "Slight S1 Variation",
        description: "Minor variation in S1 intensity detected, likely due to respiratory influence.",
        icon: AlertTriangle,
        iconColor: "text-warning",
      },
    ],
  };
  
  const COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-powered assessment of your recording
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Primary Assessment</h3>
                <div className="mt-2 p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {analysisResults.primaryCondition.status === "normal" ? (
                        <CheckCircle2 className="h-5 w-5 text-success mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                      )}
                      <span className="font-medium">{analysisResults.primaryCondition.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {analysisResults.primaryCondition.confidence}% confidence
                    </span>
                  </div>
                  <Progress 
                    value={analysisResults.primaryCondition.confidence} 
                    className="h-2"
                    indicatorClassName={analysisResults.primaryCondition.status === "normal" ? "bg-success" : "bg-warning"}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Key Findings</h3>
                <div className="mt-2 space-y-3">
                  {analysisResults.keyFindings.map((finding) => (
                    <div key={finding.id} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-start gap-3">
                        <finding.icon className={`h-5 w-5 ${finding.iconColor} mt-0.5`} />
                        <div>
                          <h4 className="font-medium">{finding.title}</h4>
                          <p className="text-sm text-muted-foreground">{finding.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <div>
              <h3 className="text-lg font-medium mb-4">Confidence Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResults.confidenceScores}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analysisResults.confidenceScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, "Confidence"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
        
        <Tabs defaultValue="waveform">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waveform">Waveform</TabsTrigger>
            <TabsTrigger value="spectrogram">Spectrogram</TabsTrigger>
            <TabsTrigger value="frequency">Frequency</TabsTrigger>
          </TabsList>
          <TabsContent value="waveform" className="mt-4">
            <div className="h-48 rounded-lg bg-muted ecg-grid overflow-hidden">
              <svg className="waveform-line" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <path
                  d="M0,100 Q25,90 50,100 T100,110 T150,90 T200,80 T250,100 T300,120 T350,90 T400,70 T450,110 T500,130 T550,90 T600,80 T650,100 T700,120 T750,90 T800,70 T850,110 T900,100 T950,90 T1000,100"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </TabsContent>
          <TabsContent value="spectrogram" className="mt-4">
            <div className="h-48 rounded-lg bg-muted overflow-hidden">
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-70" />
            </div>
          </TabsContent>
          <TabsContent value="frequency" className="mt-4">
            <div className="h-48 rounded-lg bg-muted overflow-hidden">
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1464639351491-a172c2aa2911?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-70" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}