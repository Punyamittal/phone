"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export function LearningCenterHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2"
        >
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">AI Learning Center</h1>
            <p className="text-muted-foreground">
              Understand how EchoMed's AI technology works
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search learning resources..."
            className="pl-9 w-full sm:w-64"
          />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="ai">AI Technology</TabsTrigger>
            <TabsTrigger value="medical">Medical Science</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-none bg-gradient-to-r from-primary/20 to-chart-2/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center md:text-left md:flex-1">
                <h2 className="text-xl font-semibold mb-2">Welcome to the EchoMed Learning Center</h2>
                <p className="text-muted-foreground">
                  Explore how our AI technology works, understand the science behind heart and lung sound analysis, 
                  and learn how to get the most accurate results from your EchoMed device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}