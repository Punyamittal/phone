"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Heart, 
  BookOpen,
  Brain, 
  Apple, 
  User,
  Activity, 
  Dumbbell, 
  Search, 
  BarChart,
  Stethoscope 
} from "lucide-react";

// Define topic data without storing icon components directly
const HEALTH_TOPICS = [
  { id: "all", label: "All Topics" },
  { id: "heart-health", label: "Heart Health" },
  { id: "medications", label: "Medications" },
  { id: "mental-health", label: "Mental Health" },
  { id: "nutrition", label: "Nutrition" },
  { id: "pediatrics", label: "Pediatrics" },
  { id: "fitness", label: "Fitness" },
  { id: "research", label: "Medical Research" },
  { id: "first-aid", label: "First Aid" },
  { id: "holistic", label: "Holistic Health" },
  { id: "physical-therapy", label: "Physical Therapy" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "vital-signs", label: "Vital Signs" },
];

interface TopicFilterProps {
  onSelectTopic: (topicId: string) => void;
  selectedTopic?: string;
}

// Helper function to render the appropriate icon based on topic ID
const renderIcon = (topicId: string) => {
  switch (topicId) {
    case "all":
      return <Search className="h-4 w-4" />;
    case "heart-health":
      return <Heart className="h-4 w-4" />;
    case "medications":
      return <Activity className="h-4 w-4" />;
    case "mental-health":
      return <Brain className="h-4 w-4" />;
    case "nutrition":
      return <Apple className="h-4 w-4" />;
    case "pediatrics":
      return <User className="h-4 w-4" />;
    case "fitness":
      return <Dumbbell className="h-4 w-4" />;
    case "research":
      return <BookOpen className="h-4 w-4" />;
    case "first-aid":
      return <Activity className="h-4 w-4" />;
    case "holistic":
      return <Heart className="h-4 w-4" />;
    case "physical-therapy":
      return <User className="h-4 w-4" />;
    case "diagnostics":
      return <Stethoscope className="h-4 w-4" />;
    case "vital-signs":
      return <Activity className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
};

export function TopicFilter({ onSelectTopic, selectedTopic = "all" }: TopicFilterProps) {
  return (
    <div className="w-full mb-8">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 p-1">
          {HEALTH_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic.id;
            
            return (
              <motion.div
                key={topic.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "px-3 py-2 rounded-full",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-background",
                    "transition-all duration-200 flex items-center gap-1.5"
                  )}
                  onClick={() => onSelectTopic(topic.id)}
                >
                  {renderIcon(topic.id)}
                  <span>{topic.label}</span>
                  
                  {isSelected && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
} 