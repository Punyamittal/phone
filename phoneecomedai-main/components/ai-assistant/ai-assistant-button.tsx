"use client";

import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "./ai-assistant-provider";
import { motion } from "framer-motion";

export function AIAssistantButton() {
  const { openAssistant } = useAIAssistant();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={openAssistant} 
        variant="outline" 
        size="icon" 
        className="relative"
      >
        <MessageSquareText className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
      </Button>
    </motion.div>
  );
}