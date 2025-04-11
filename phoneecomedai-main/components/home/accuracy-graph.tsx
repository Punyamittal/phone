"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const heartData = [
  { name: "Jan", EchoMed: 97.2, Traditional: 92.1 },
  { name: "Feb", EchoMed: 97.5, Traditional: 92.3 },
  { name: "Mar", EchoMed: 97.8, Traditional: 92.4 },
  { name: "Apr", EchoMed: 98.1, Traditional: 92.5 },
  { name: "May", EchoMed: 98.4, Traditional: 92.7 },
  { name: "Jun", EchoMed: 98.7, Traditional: 92.8 },
  { name: "Jul", EchoMed: 99.0, Traditional: 93.0 },
  { name: "Aug", EchoMed: 99.2, Traditional: 93.1 },
];

const lungData = [
  { name: "Jan", EchoMed: 96.5, Traditional: 91.2 },
  { name: "Feb", EchoMed: 96.8, Traditional: 91.4 },
  { name: "Mar", EchoMed: 97.1, Traditional: 91.5 },
  { name: "Apr", EchoMed: 97.4, Traditional: 91.7 },
  { name: "May", EchoMed: 97.7, Traditional: 91.8 },
  { name: "Jun", EchoMed: 98.0, Traditional: 92.0 },
  { name: "Jul", EchoMed: 98.3, Traditional: 92.1 },
  { name: "Aug", EchoMed: 98.5, Traditional: 92.3 },
];

export function AccuracyGraph() {
  const [activeTab, setActiveTab] = useState("heart");
  
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Diagnostic Accuracy</CardTitle>
              <CardDescription className="text-lg">
                EchoMed consistently outperforms traditional mobile diagnostic tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="heart" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList>
                    <TabsTrigger value="heart">Heart Analysis</TabsTrigger>
                    <TabsTrigger value="lung">Lung Analysis</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="heart" className="mt-0">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={heartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis 
                          domain={[90, 100]} 
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value) => [`${value}%`, ""]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="EchoMed"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                          animationDuration={1500}
                        />
                        <Line
                          type="monotone"
                          dataKey="Traditional"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Current Accuracy</p>
                      <p className="text-3xl font-bold text-primary">99.2%</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Improvement</p>
                      <p className="text-3xl font-bold">+6.1%</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Clinical Validation</p>
                      <p className="text-3xl font-bold">12 Studies</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="lung" className="mt-0">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={lungData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis 
                          domain={[90, 100]} 
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value) => [`${value}%`, ""]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="EchoMed"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                          animationDuration={1500}
                        />
                        <Line
                          type="monotone"
                          dataKey="Traditional"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-chart-2/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Current Accuracy</p>
                      <p className="text-3xl font-bold text-chart-2">98.5%</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Improvement</p>
                      <p className="text-3xl font-bold">+6.2%</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Clinical Validation</p>
                      <p className="text-3xl font-bold">10 Studies</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}