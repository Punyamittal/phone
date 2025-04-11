"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Dumbbell, Pill, Utensils, Microscope, BabyIcon, EyeIcon, ToothIcon, LungsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
}

const categories: TopicCategory[] = [
  { 
    id: "cardiovascular",
    title: "Heart Health", 
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400",
  },
  { 
    id: "mental-health",
    title: "Mental Health", 
    icon: Brain,
    color: "bg-purple-100 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400",
  },
  { 
    id: "fitness",
    title: "Fitness", 
    icon: Dumbbell,
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400",
  },
  { 
    id: "medication",
    title: "Medication", 
    icon: Pill,
    color: "bg-green-100 dark:bg-green-900/20 text-green-500 dark:text-green-400",
  },
  { 
    id: "nutrition",
    title: "Nutrition", 
    icon: Utensils,
    color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500 dark:text-yellow-400",
  },
  { 
    id: "research",
    title: "Medical Research", 
    icon: Microscope,
    color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400",
  },
  { 
    id: "pediatrics",
    title: "Pediatrics", 
    icon: BabyIcon,
    color: "bg-pink-100 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400",
  },
  { 
    id: "vision",
    title: "Eye Health", 
    icon: EyeIcon,
    color: "bg-teal-100 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400",
  },
  { 
    id: "dental",
    title: "Dental Care", 
    icon: ToothIcon,
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400",
  },
  { 
    id: "respiratory",
    title: "Respiratory Health", 
    icon: LungsIcon,
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400",
  },
];

interface TopicCategoriesProps {
  onSelectTopic: (topic: string) => void;
}

export function TopicCategories({ onSelectTopic }: TopicCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: TopicCategory) => {
    setSelectedCategory(category.id);
    onSelectTopic(category.title);
  };

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all",
              category.color,
              selectedCategory === category.id ? "ring-2 ring-primary" : "hover:shadow-md"
            )}
          >
            <category.icon className="h-8 w-8 mb-1" />
            <span className="text-sm font-medium">{category.title}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 