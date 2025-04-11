"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Settings as Lungs, Info } from "lucide-react";
import Link from "next/link";

export function AnalysisHeader() {
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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Health Analysis</h1>
            <p className="text-muted-foreground">
              Record and analyze your heart and lung sounds
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="heart">
            <TabsList>
              <TabsTrigger value="heart" className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Heart
              </TabsTrigger>
              <TabsTrigger value="lungs" className="flex items-center gap-1">
                <Lungs className="h-4 w-4" />
                Lungs
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-none bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">How to record heart sounds</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  For best results, find a quiet environment. Place your phone's microphone directly against your chest, 
                  slightly to the left of your sternum. Hold still and breathe normally during the recording.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}