"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  description,
  icon,
  className,
  actionLabel,
  onAction
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", icon && "ml-1")}>
            {title}
          </h2>
          
          {description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
          onClick={onAction}
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
} 